import { describe, expect, it } from 'vitest';
import { istAktiv, kuerzelVon, navigationFuer, seiteFuer } from './navigation';

const hrefs = (g: ReturnType<typeof navigationFuer>) =>
  g.flatMap((x) => x.eintraege.map((e) => e.href));

describe('navigationFuer', () => {
  it('zeigt Mitarbeitern nichts, was sie abweisen würde', () => {
    const g = navigationFuer({ rolle: 'tenant_member', istPlattformAdmin: false });
    expect(hrefs(g)).toEqual(['/']);
  });

  it('zeigt Kunden-Admins Zugriff & Support', () => {
    const g = navigationFuer({ rolle: 'tenant_admin', istPlattformAdmin: false });
    expect(hrefs(g)).toContain('/einstellungen/zugriff');
    expect(g.some((x) => x.titel === 'Plattform')).toBe(false);
  });

  it('gibt Plattform-Admins eine eigene Gruppe', () => {
    const g = navigationFuer({ rolle: null, istPlattformAdmin: true });
    const plattform = g.find((x) => x.titel === 'Plattform');
    expect(plattform?.eintraege.map((e) => e.href)).toEqual(['/verwaltung/betriebe']);
    expect(hrefs(g)).not.toContain('/einstellungen/zugriff');
  });
});

describe('istAktiv / seiteFuer', () => {
  it('lässt Start nur exakt passen', () => {
    expect(istAktiv('/', '/')).toBe(true);
    expect(istAktiv('/', '/verwaltung/betriebe')).toBe(false);
    expect(istAktiv('/verwaltung/betriebe', '/verwaltung/betriebe/neu')).toBe(true);
    expect(istAktiv('/verwaltung/betriebe', '/verwaltung/betriebe-x')).toBe(false);
  });

  it('liefert Gruppe und Titel für die Kopfzeile', () => {
    const g = navigationFuer({ rolle: 'tenant_admin', istPlattformAdmin: true });
    expect(seiteFuer(g, '/verwaltung/betriebe')).toEqual({
      gruppe: 'Plattform',
      titel: 'Betriebe',
    });
    expect(seiteFuer(g, '/gibt-es-nicht')).toBeNull();
  });
});

describe('kuerzelVon', () => {
  it('nimmt das Kürzel, wenn vorhanden', () => {
    expect(kuerzelVon('Fahrschule Muster', 'fm')).toBe('FM');
  });

  it('bildet ersatzweise Initialen', () => {
    expect(kuerzelVon('Fahrschule Muster', '')).toBe('FM');
    expect(kuerzelVon('Fahrschule Muster', null)).toBe('FM');
    expect(kuerzelVon('Heidi')).toBe('HE');
    expect(kuerzelVon('   ')).toBe('?');
  });
});
