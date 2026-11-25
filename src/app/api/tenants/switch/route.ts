import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ForbiddenError, requireSession, roleInTenant } from '@/lib/auth/session';
import { switchTenantSchema } from '@/lib/validation/schemas';
import { handleError, ok } from '@/lib/api/respond';

/**
 * POST /api/tenants/switch
 *
 * Setzt den aktiven Betrieb. Der Wert landet im Profil, nicht im Browser –
 * ein Browserwert ließe sich auf einen fremden Betrieb ändern.
 *
 * Doppelt gesichert: hier gegen die Mitgliedschaften der Sitzung, und in der
 * Datenbank durch den Trigger `profiles_guard_update`.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json().catch(() => ({}));
    const { tenantId } = switchTenantSchema.parse(body);

    const isMember = roleInTenant(session, tenantId) !== null;
    if (!isMember && !session.isPlatformAdmin) {
      throw new ForbiddenError('Kein Zugriff auf diesen Betrieb');
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ last_tenant_id: tenantId })
      .eq('id', session.userId);

    if (error) {
      throw new ForbiddenError('Kein Zugriff auf diesen Betrieb');
    }

    return ok({ ok: true, tenantId });
  } catch (error) {
    return handleError(error);
  }
}
