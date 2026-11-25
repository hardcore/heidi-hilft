import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ForbiddenError, requireSession, roleInTenant } from '@/lib/auth/session';
import { fail, handleError, ok } from '@/lib/api/respond';

const MAX_ROWS = 200;

/**
 * GET /api/access-log?tenantId=...
 *
 * Das Zugriffsprotokoll eines Betriebs. Jedes Mitglied darf es lesen –
 * Transparenz ist der Zweck. Niemand darf es ändern oder löschen;
 * das ist in der Datenbank verboten, nicht nur hier.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();

    const tenantId =
      request.nextUrl.searchParams.get('tenantId') ?? session.activeTenant?.id;

    if (!tenantId) {
      return fail('Kein Betrieb ausgewählt', 400);
    }

    if (roleInTenant(session, tenantId) === null && !session.isPlatformAdmin) {
      throw new ForbiddenError('Kein Zugriff auf diesen Betrieb');
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('access_log')
      .select('id, actor_email, as_platform_admin, area, action, occurred_at')
      .eq('tenant_id', tenantId)
      .order('occurred_at', { ascending: false })
      .limit(MAX_ROWS);

    if (error) return fail('Das Protokoll konnte nicht geladen werden', 500);

    return ok({ entries: data ?? [] });
  } catch (error) {
    return handleError(error);
  }
}
