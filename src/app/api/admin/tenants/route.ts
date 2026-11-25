import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePlatformAdmin, requireSession } from '@/lib/auth/session';
import { createTenantSchema } from '@/lib/validation/schemas';
import { fail, handleError, ok } from '@/lib/api/respond';

/**
 * GET /api/admin/tenants
 *
 * Betriebsübersicht für AWSMD. Nur Stammdaten und Zustand – keine Inhalte.
 * Die Zugriffsregeln geben einem Plattform-Admin ohnehin nur das heraus.
 */
export async function GET() {
  try {
    const session = await requireSession();
    requirePlatformAdmin(session);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, short_name, status, created_at')
      .order('name', { ascending: true })
      .limit(500);

    if (error) return fail('Betriebe konnten nicht geladen werden', 500);

    return ok({ tenants: data ?? [] });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/tenants
 *
 * Legt einen Betrieb an und lädt den ersten Kunden-Admin ein.
 *
 * Nutzt den Dienstschlüssel, weil ein Nutzer eingeladen werden muss – das geht
 * nicht mit dem öffentlichen Schlüssel. Die Berechtigung wird vorher über die
 * normale Sitzung geprüft, nicht über den Dienstschlüssel.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    requirePlatformAdmin(session);

    const body = await request.json().catch(() => ({}));
    const { name, shortName, adminEmail } = createTenantSchema.parse(body);

    const admin = createAdminClient();

    const { data: tenant, error: tenantError } = await admin
      .from('tenants')
      .insert({ name, short_name: shortName })
      .select('id, name, short_name, status')
      .single();

    if (tenantError || !tenant) {
      return fail('Der Betrieb konnte nicht angelegt werden', 500);
    }

    // Bestehendes Profil wiederverwenden: dieselbe Adresse bekommt kein zweites
    // Konto, sondern eine zweite Mitgliedschaft (AC: Einladung in zweiten Betrieb).
    const { data: existing } = await admin
      .from('profiles')
      .select('id')
      .eq('email', adminEmail)
      .maybeSingle();

    let profileId = existing?.id ?? null;

    if (!profileId) {
      const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const { data: invited, error: inviteError } =
        await admin.auth.admin.inviteUserByEmail(adminEmail, {
          redirectTo: `${base.replace(/\/$/, '')}/auth/callback`,
        });

      if (inviteError || !invited?.user) {
        // Betrieb wieder entfernen, damit keine halb angelegten Kunden zurückbleiben.
        await admin.from('tenants').delete().eq('id', tenant.id);
        return fail('Die Einladung konnte nicht verschickt werden', 502);
      }
      profileId = invited.user.id;
    }

    const { error: membershipError } = await admin.from('memberships').insert({
      tenant_id: tenant.id,
      profile_id: profileId,
      role: 'tenant_admin',
      status: 'invited',
    });

    if (membershipError) {
      await admin.from('tenants').delete().eq('id', tenant.id);
      return fail('Die Mitgliedschaft konnte nicht angelegt werden', 500);
    }

    return ok({ tenant, invitedAdmin: adminEmail }, 201);
  } catch (error) {
    return handleError(error);
  }
}
