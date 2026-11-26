import type { Metadata } from 'next';
import { getSessionContext } from '@/lib/auth/session';
import { AbmeldenKnopf } from '@/components/abmelden-knopf';
import { HinweisKarte } from '@/components/hinweis-karte';

export const metadata: Metadata = { title: 'Kein Betrieb · Heidi' };

/**
 * Hinweisseite für angemeldete Nutzer ohne Mitgliedschaft.
 * Besser als eine leere Anwendung: der Nutzer erfährt, was fehlt und wen er fragt.
 */
export default async function KeinBetriebSeite() {
  const session = await getSessionContext();

  return (
    <HinweisKarte titel="Du bist noch keinem Betrieb zugeordnet">
      <div className="flex flex-col gap-3 text-[16px] leading-relaxed text-h-text-soft">
        <p>
          Die Anmeldung hat geklappt
          {session?.email ? (
            <>
              {' '}
              – du bist als <span className="font-medium text-h-text">{session.email}</span>{' '}
              angemeldet
            </>
          ) : null}
          . Dein Zugang gehört aber noch zu keinem Betrieb.
        </p>
        <p>
          Bitte dein Büro, dich einzuladen. Wer dich einlädt, braucht dafür nur deine
          E-Mail-Adresse.
        </p>
      </div>
      <AbmeldenKnopf />
    </HinweisKarte>
  );
}
