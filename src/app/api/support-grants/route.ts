import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireSession, requireTenantAdmin } from '@/lib/auth/session';
import { supportGrantSchema } from '@/lib/validation/schemas';
import { logAccess } from '@/lib/auth/audit';
import { fail, handleError, ok } from '@/lib/api/respond';

/**
 * POST /api/support-grants
 *
 * Ein Kunden-Admin gibt AWSMD für 24 Stunden Einblick in seine Inhalte.
 * Das Fenster setzt die Datenbank (Trigger `support_grants_pin_window`) –
 * die Anwendung kann es nicht verlängern.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json().catch(() => ({}));
    const { tenantId } = supportGrantSchema.parse(body);

    requireTenantAdmin(session, tenantId);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('support_grants')
      .insert({
        tenant_id: tenantId,
        granted_by: session.userId,
        // Wird vom Trigger überschrieben; hier nur, weil die Spalte NOT NULL ist.
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id, granted_at, expires_at')
      .single();

    if (error) {
      // Unique-Index: es läuft bereits eine Freigabe.
      if (error.code === '23505' || error.code === '23P01') {
        return fail('Für diesen Betrieb läuft bereits eine Freigabe', 409);
      }
      return fail('Die Freigabe konnte nicht erteilt werden', 500);
    }

    await logAccess({ session, tenantId, area: 'support_grant', action: 'grant' });

    return ok({ grant: data }, 201);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/support-grants
 *
 * Widerruft die laufende Freigabe. Der Einblick endet sofort.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json().catch(() => ({}));
    const { tenantId } = supportGrantSchema.parse(body);

    requireTenantAdmin(session, tenantId);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('support_grants')
      .update({ revoked_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .is('revoked_at', null)
      .select('id');

    if (error) return fail('Die Freigabe konnte nicht widerrufen werden', 500);
    if (!data || data.length === 0) {
      return fail('Für diesen Betrieb läuft keine Freigabe', 404);
    }

    await logAccess({ session, tenantId, area: 'support_grant', action: 'revoke' });

    return ok({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
