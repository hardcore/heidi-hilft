import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Wächter für „Nie Farbe hart in Komponenten schreiben" (docs/design-system.md).
 * Farben gehören in die Token in globals.css; shadcn-Bausteine in ui/ sind ausgenommen.
 */
const WURZEL = join(__dirname, '..');
const ORDNER = ['app', 'components'].map((o) => join(WURZEL, o));
const AUSGENOMMEN = [join(WURZEL, 'components', 'ui')];
const FARBWERT = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(\s*\d/;

function dateien(ordner: string): string[] {
  return readdirSync(ordner).flatMap((name) => {
    const pfad = join(ordner, name);
    if (AUSGENOMMEN.includes(pfad)) return [];
    if (statSync(pfad).isDirectory()) return dateien(pfad);
    return /\.(tsx?|jsx?)$/.test(name) && !/\.test\./.test(name) ? [pfad] : [];
  });
}

describe('Design-Token', () => {
  it('kein fester Farbwert in src/app und src/components (außer ui/)', () => {
    const treffer = ORDNER.flatMap(dateien).flatMap((pfad) =>
      readFileSync(pfad, 'utf8')
        .split('\n')
        .map((zeile, i) => ({ zeile, i }))
        .filter(({ zeile }) => FARBWERT.test(zeile))
        .map(({ zeile, i }) => `${relative(WURZEL, pfad)}:${i + 1}  ${zeile.trim()}`),
    );
    expect(treffer).toEqual([]);
  });
});
