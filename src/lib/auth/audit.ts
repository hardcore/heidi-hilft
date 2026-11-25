import { createClient } from '@/lib/supabase/server';
import type { AccessAction, SessionContext } from '@/lib/supabase/types';

/**
 * Schreibt einen Eintrag ins Zugriffsprotokoll.
 *
 * Bewusst OHNE Nachrichteninhalte, Namen oder Telefonnummern von Endkunden –
 * nur wer, wann, welcher Bereich. Das Protokoll ist nur anfügbar; selbst AWSMD
 * kann Einträge nicht ändern oder löschen (per Zugriffsregel erzwungen).
 */
export async function logAccess(params: {
  session: SessionContext;
  tenantId: string;
  area: string;
  action: AccessAction;
}): Promise<void> {
  const { session, tenantId, area, action } = params;
  const supabase = await createClient();

  const { error } = await supabase.from('access_log').insert({
    tenant_id: tenantId,
    actor_id: session.userId,
    actor_email: session.email,
    as_platform_admin: session.isPlatformAdmin && !roleKnown(session, tenantId),
    area,
    action,
  });

  if (error) {
    // Ein fehlgeschlagenes Protokoll darf die Aktion nicht verschlucken,
    // aber es muss auffallen. Kein Inhalt im Log – nur die Kennung.
    console.error('[audit] Eintrag konnte nicht geschrieben werden', {
      tenantId,
      area,
      action,
      code: error.code,
    });
  }
}

function roleKnown(session: SessionContext, tenantId: string): boolean {
  return session.memberships.some((m) => m.tenant_id === tenantId);
}
