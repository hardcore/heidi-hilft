import type { Metadata } from 'next';
import { AnmeldeFormular } from '@/components/anmelde-formular';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = { title: 'Anmelden · Heidi' };

/** Hinweise, die von der Rückkehrseite durchgereicht werden. */
const FEHLERTEXTE: Record<string, string> = {
  abgelaufen:
    'Der Anmeldelink ist abgelaufen. Fordere unten einen neuen an – er gilt 60 Minuten.',
  verbraucht:
    'Dieser Anmeldelink wurde schon verwendet. Jeder Link lässt sich nur einmal benutzen. Fordere unten einen neuen an.',
  ungueltig:
    'Mit diesem Link konnten wir dich nicht anmelden. Fordere unten einen neuen an.',
  anderergeraet:
    'Dieser Link konnte in diesem Browser nicht eingelöst werden. Fordere unten einen neuen an und öffne ihn auf demselben Gerät.',
  abgemeldet: 'Du bist abgemeldet.',
};

export default async function AnmeldenSeite({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string; weiter?: string }>;
}) {
  const { fehler, weiter } = await searchParams;
  const hinweis = fehler ? FEHLERTEXTE[fehler] ?? FEHLERTEXTE.ungueltig : null;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium tracking-tight">Bei Heidi anmelden</h1>
          <p className="text-muted-foreground">
            Für Betriebe und ihr Team.
          </p>
        </div>

        {hinweis && (
          <Alert variant={fehler === 'abgemeldet' ? 'default' : 'destructive'}>
            <AlertDescription>{hinweis}</AlertDescription>
          </Alert>
        )}

        <AnmeldeFormular weiter={weiter} />
      </div>
    </main>
  );
}
