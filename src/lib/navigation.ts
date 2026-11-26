import type { MembershipRole } from '@/lib/supabase/types';

export type NavIcon = 'start' | 'zugriff' | 'betriebe';

export interface NavEintrag {
  href: string;
  titel: string;
  icon: NavIcon;
}

export interface NavGruppe {
  /** Mono-Überschrift; null für die oberste Gruppe ohne Überschrift. */
  titel: string | null;
  eintraege: NavEintrag[];
}

/**
 * Navigation nach Rolle.
 *
 * Ausblenden ist Komfort, kein Schutz: jede Seite prüft die Rolle selbst, und die
 * Datenbank lässt ohnehin nur zu, was die Mitgliedschaft erlaubt. Einträge gibt es
 * nur für Seiten, die existieren – jedes Feature bringt seinen Eintrag mit.
 */
export function navigationFuer({
  rolle,
  istPlattformAdmin,
}: {
  rolle: MembershipRole | null;
  istPlattformAdmin: boolean;
}): NavGruppe[] {
  const gruppen: NavGruppe[] = [
    { titel: null, eintraege: [{ href: '/', titel: 'Start', icon: 'start' }] },
  ];

  if (rolle === 'tenant_admin') {
    gruppen.push({
      titel: 'Einstellungen',
      eintraege: [
        { href: '/einstellungen/zugriff', titel: 'Zugriff & Support', icon: 'zugriff' },
      ],
    });
  }

  if (istPlattformAdmin) {
    gruppen.push({
      titel: 'Plattform',
      eintraege: [{ href: '/verwaltung/betriebe', titel: 'Betriebe', icon: 'betriebe' }],
    });
  }

  return gruppen;
}

/** Ob ein Eintrag zur aktuellen Seite gehört. `/` passt nur exakt. */
export function istAktiv(href: string, pfad: string): boolean {
  if (href === '/') return pfad === '/';
  return pfad === href || pfad.startsWith(`${href}/`);
}

/** Gruppe und Titel der aktuellen Seite für die Kopfzeile. */
export function seiteFuer(
  gruppen: NavGruppe[],
  pfad: string,
): { gruppe: string | null; titel: string } | null {
  for (const g of gruppen) {
    const e = g.eintraege.find((x) => istAktiv(x.href, pfad));
    if (e) return { gruppe: g.titel, titel: e.titel };
  }
  return null;
}

/**
 * Kürzel für die Betriebskarte. Laut Schema Pflicht, Altbestand kann es trotzdem
 * leer haben – dann Initialen aus dem Namen.
 */
export function kuerzelVon(name: string, kurz?: string | null): string {
  const k = kurz?.trim();
  if (k) return k.slice(0, 3).toUpperCase();
  const woerter = name.trim().split(/\s+/).filter(Boolean);
  if (woerter.length === 0) return '?';
  if (woerter.length === 1) return woerter[0].slice(0, 2).toUpperCase();
  return (woerter[0][0] + woerter[1][0]).toUpperCase();
}
