import type { Metadata } from 'next';
import { getSessionContext } from '@/lib/auth/session';
import { AbmeldenKnopf } from '@/components/abmelden-knopf';
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
  const andere = (session?.memberships ?? []).filter(
    (m) => m.tenant.status === 'active',
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-5 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-medium tracking-tight">
          {session?.activeTenant?.name ?? 'Dieser Betrieb'} ist gesperrt
        </h1>
        <div className="space-y-3 text-muted-foreground">
          <p>
            Der Zugang zu den Daten dieses Betriebs ist derzeit nicht möglich. Bitte
            wende dich an AWSMD.
          </p>
          <p>
            Eingehende WhatsApp-Nachrichten werden weiter entgegengenommen und
            gespeichert – Heidi antwortet in dieser Zeit nur nicht. Es geht nichts
            verloren.
          </p>
        </div>

        {andere.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Du gehörst noch zu {andere.length === 1 ? 'einem weiteren Betrieb' : `${andere.length} weiteren Betrieben`}:
            </p>
            <MandantenWechsler
              tenants={session!.memberships.map((m) => ({
                id: m.tenant.id,
                name: m.tenant.name,
                shortName: m.tenant.short_name,
                status: m.tenant.status,
                role: m.role,
              }))}
              aktiv={session!.activeTenant?.id ?? null}
            />
          </div>
        )}

        <AbmeldenKnopf />
      </div>
    </main>
  );
}
