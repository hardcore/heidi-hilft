import type { Metadata } from 'next';
import { getSessionContext } from '@/lib/auth/session';
import { AbmeldenKnopf } from '@/components/abmelden-knopf';
import { HinweisKarte } from '@/components/hinweis-karte';
import { MandantenWechsler } from '@/components/mandanten-wechsler';

export const metadata: Metadata = { title: 'Betrieb gesperrt · Heidi' };

/**
 * Hinweisseite für einen gesperrten Betrieb.
 *
 * Wichtig: eingehende WhatsApp-Nachrichten werden weiter angenommen und
 * gespeichert, nur nicht beantwortet. Das steht hier, damit niemand Datenverlust
 * befürchtet.
 */
export default async function BetriebGesperrtSeite() {
  const session = await getSessionContext();
  const andere = (session?.memberships ?? []).filter((m) => m.tenant.status === 'active');

  return (
    <HinweisKarte titel={`${session?.activeTenant?.name ?? 'Dieser Betrieb'} ist gesperrt`}>
      <div className="flex flex-col gap-3 text-[16px] leading-relaxed text-h-text-soft">
        <p>
          Der Zugang zu den Daten dieses Betriebs ist derzeit nicht möglich. Bitte wende dich an
          AWSMD.
        </p>
        <p>
          Eingehende WhatsApp-Nachrichten werden weiter entgegengenommen und gespeichert – Heidi
          antwortet in dieser Zeit nur nicht. Es geht nichts verloren.
        </p>
      </div>

      {session && andere.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-h-border pt-5">
          <p className="text-sm text-h-text-muted">
            Du gehörst noch zu{' '}
            {andere.length === 1 ? 'einem weiteren Betrieb' : `${andere.length} weiteren Betrieben`}:
          </p>
          <MandantenWechsler
            tenants={session.memberships.map((m) => ({
              id: m.tenant.id,
              name: m.tenant.name,
              shortName: m.tenant.short_name,
              status: m.tenant.status,
              role: m.role,
            }))}
            aktiv={session.activeTenant?.id ?? null}
          />
        </div>
      )}

      <AbmeldenKnopf />
    </HinweisKarte>
  );
}
