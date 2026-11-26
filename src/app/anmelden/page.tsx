import type { Metadata } from 'next';
import { AnmeldeFormular } from '@/components/anmelde-formular';
import { HinweisKarte } from '@/components/hinweis-karte';
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
    <HinweisKarte titel="Bei Heidi anmelden">
      <p className="-mt-2 text-[16px] text-h-text-muted">Für Betriebe und ihr Team.</p>

      {hinweis && (
        <Alert variant={fehler === 'abgemeldet' ? 'default' : 'destructive'}>
          <AlertDescription>{hinweis}</AlertDescription>
        </Alert>
      )}

      <AnmeldeFormular weiter={weiter} />
    </HinweisKarte>
  );
}
