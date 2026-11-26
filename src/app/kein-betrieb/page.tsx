import type { Metadata } from 'next';
import { getSessionContext } from '@/lib/auth/session';
import { AbmeldenKnopf } from '@/components/abmelden-knopf';

export const metadata: Metadata = { title: 'Kein Betrieb · Heidi' };

/**
 * Hinweisseite für angemeldete Nutzer ohne Mitgliedschaft.
 * Besser als eine leere Anwendung: der Nutzer erfährt, was fehlt und wen er fragt.
 */
export default async function KeinBetriebSeite() {
  const session = await getSessionContext();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-5 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-medium tracking-tight">
          Du bist noch keinem Betrieb zugeordnet
        </h1>
        <div className="space-y-3 text-muted-foreground">
          <p>
            Die Anmeldung hat geklappt
            {session?.email ? (
              <>
                {' '}
                – du bist als{' '}
                <span className="font-medium text-foreground">{session.email}</span> angemeldet
              </>
            ) : null}
            . Dein Zugang gehört aber noch zu keiner Fahrschule.
          </p>
          <p>
            Bitte dein Büro, dich einzuladen. Wer dich einlädt, braucht dafür nur
            deine E-Mail-Adresse.
          </p>
        </div>
        <AbmeldenKnopf />
      </div>
    </main>
  );
}
