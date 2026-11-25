# Design-System — Heidi

> Abgeleitet aus dem Prototyp „Auswertung – Heidi Dark" (Claude Design).
> Der Prototyp liefert die verbindlichen Werte für Dark. Die Hell-Palette ist daraus
> abgeleitet: **gleiche** Abstände, Radien, Typografie und Layout, nur andere Flächen.

## Grundsätze

- **Zwei Themes, OS entscheidet.** `prefers-color-scheme` ist die Voreinstellung; in den
  Einstellungen kann der Nutzer auf „Hell", „Dunkel" oder „System" stellen. Umsetzung über
  CSS-Variablen auf `:root` / `.dark` (Tailwind `darkMode: 'class'` + Theme-Provider, der
  initial dem System folgt).
- **Nie Farbe hart in Komponenten schreiben.** Immer Token verwenden.
- **shadcn/ui zuerst.** Die Token unten werden auf die shadcn-CSS-Variablen gemappt;
  installierte shadcn-Komponenten werden nie nachgebaut.
- **Große Klickflächen.** Minimale Höhe für Buttons, Inputs und Nav-Einträge: **44 px**
  (primäre Aktionen 46 px). Die Zielgruppe arbeitet im Büro und am Handy.
- **Ruhige Flächen, sprechende Zahlen.** Kennzahlen sind groß (58 px, 600), Beschriftungen
  klein und in Mono mit Sperrung.

## Farb-Token

### Dark (verbindlich, aus dem Prototyp)

| Token | Wert | Verwendung |
|-------|------|------------|
| `--canvas` | `#3D3D3F` | Äußere Fläche hinter der App-Hülle |
| `--shell` | `#0B0B0D` | App-Hülle, in der die Panels liegen |
| `--surface` | `#141416` | Panels: Hauptbereich, Sidebar-Panel, rechtes Rail |
| `--surface-2` | `#17171A` | Karten innerhalb eines Panels |
| `--surface-3` | `#202025` | Tabellenkopf, eingehende Chat-Bubble, Hervorhebung |
| `--surface-active` | `#1E1E23` | Aktiver Nav-Eintrag, Avatar-Fläche |
| `--surface-hover` | `#1C1C20` | Hover auf Nav-Einträgen |
| `--input` | `#0F0F11` | Suchfeld |
| `--control` | `#111113` | Buttons, Chips, Icon-Buttons, Eingabekarte |
| `--border` | `#222227` | Panel-Rahmen, Trennlinien im Panel |
| `--border-muted` | `#26262B` | Kartenrahmen, Tabellenzeilen |
| `--border-strong` | `#2A2A30` | Button-, Chip- und Input-Rahmen |
| `--text` | `#EDEDEF` | Standardtext |
| `--text-strong` | `#FFFFFF` | Aktiver Nav-Eintrag, Hover |
| `--text-soft` | `#C9C9D0` | Sekundärer Text, Icons in Nav |
| `--text-muted` | `#9A9AA3` | Beschriftungen, Achsen, Platzhalter |
| `--accent` | `#7356F1` | Violett: Marke, primärer Button, Balken, Badge |
| `--accent-soft` | `#9B85F4` | Dekoratives Violett, Icons |
| `--accent-text` | `#B9A8F8` | Violetter Text auf dunkler Fläche |
| `--accent-off` | `#1F1F24` | Unbelegte Punkte im Matrix-Chart |
| `--success` | `#22C55E` | Statuspunkt |
| `--success-text` | `#4ADE80` | Statustext „aktiv", „läuft" |
| `--warning` | `#F5B83D` | WhatsApp-/Hinweis-Icon, Erinnerungen |
| `--danger` | `#F04438` | Benachrichtigungspunkt, Fehler |

### Hell (abgeleitet)

| Token | Wert | Hinweis |
|-------|------|---------|
| `--canvas` | `#E6E6EA` | |
| `--shell` | `#FFFFFF` | |
| `--surface` | `#FFFFFF` | |
| `--surface-2` | `#FAFAFB` | |
| `--surface-3` | `#F1F1F4` | |
| `--surface-active` | `#F0ECFE` | Aktiver Nav-Eintrag: violett getönt statt grau |
| `--surface-hover` | `#F4F4F6` | |
| `--input` | `#FFFFFF` | |
| `--control` | `#FFFFFF` | |
| `--border` | `#E6E6EA` | |
| `--border-muted` | `#ECECEF` | |
| `--border-strong` | `#D6D6DC` | |
| `--text` | `#17171A` | 15,8:1 auf Weiß |
| `--text-strong` | `#0B0B0D` | |
| `--text-soft` | `#44444C` | 9,7:1 |
| `--text-muted` | `#6E6E78` | 5,1:1 — erfüllt AA für Normaltext |
| `--accent` | `#7356F1` | Flächen und Rahmen; **nicht** für kleinen Text auf Weiß (4,6:1) |
| `--accent-soft` | `#5F43DD` | Violetter Text und Icons auf Weiß (6,1:1) |
| `--accent-text` | `#5B3FD6` | |
| `--accent-off` | `#EAEAEE` | Unbelegte Punkte im Matrix-Chart |
| `--success` | `#16A34A` | |
| `--success-text` | `#15803D` | |
| `--warning` | `#B45309` | Text; der Punkt/Icon bleibt `#F5B83D` |
| `--danger` | `#D92D20` | |

**Regel:** Violett als Textfarbe nur über `--accent-soft` / `--accent-text` ansprechen —
`--accent` ist die Flächenfarbe. Weiß auf `#7356F1` ergibt 4,9:1 und ist für Buttontext ab
16 px in Ordnung.

## Typografie

- **Inter** (400, 500, 600) für alles außer Beschriftungen und Zahlenachsen
- **Geist Mono** (400, 500) für Spalten- und Gruppenbeschriftungen, Achsen, Tastaturkürzel

| Rolle | Größe / Gewicht | Weiteres |
|-------|------------------|----------|
| Seitentitel (h1) | 32 px / 500 | `letter-spacing: -0.02em` |
| Panel-Titel | 28 px / 500 | `-0.02em` |
| Kennzahl | 58 px / 600 | `-0.04em`, `line-height: 1` |
| Kartentitel (h2) | 22 px / 500 | |
| Abschnittstitel | 20 px / 500 | |
| Beschreibung | 18 px / 400 | `--text-muted` |
| Fließtext, Eingaben | 16–17 px / 400 | |
| Chips, Buttons, Tabelle | 15–16 px / 400 | |
| Status-Badges | 14 px / 400 | |
| Mono-Beschriftung | 13 px / 400 | `letter-spacing: 0.14em`, GROSSBUCHSTABEN, `--text-muted` |
| Spaltenkopf (Mono) | 13 px / 400 | `letter-spacing: 0.08em` |

## Maße

**Radien:** App-Hülle 34 · Panel 22 · Karte 18 · Eingabekarte 16 · Avatar-Box 14 ·
Button/Chip/Input 10 · Icon-Fläche 8–9 · Badge 7 · Mono-Chip 6 · Chart-Punkt 2

**Abstände:** Panel-Innenabstand 24 px (Kopfzeile 14/18 px) · Abstand zwischen Panels 14 px ·
Abstand zwischen Abschnitten 22 px · Grid-Lücke 20 px · Chip-Lücke 10 px

**Layout:** Sidebar 220–280 px · Hauptbereich flexibel ab 620 px · rechtes Rail 320–400 px ·
maximale Gesamtbreite 1420 px · Schatten der Hülle `0 30px 60px rgba(0,0,0,0.35)`
(hell: `0 20px 50px rgba(17,17,26,0.08)`)

**Navigation:** Gruppen mit Mono-Überschrift; Einträge 44 px hoch, Radius 10, Icon 19 px,
`stroke-width: 1.7`.

## Chat im WhatsApp-Stil

Der Look folgt WhatsApp in Aufbau und Rhythmus, die Farben bleiben Heidi:

| Element | Dark | Hell |
|---------|------|------|
| Chat-Hintergrund | `#0F0F11` | `#F4F4F6` |
| Eingehend (Endkunde) | `#202025`, Text `--text` | `#FFFFFF`, Rahmen `--border` |
| Ausgehend (Heidi / Team) | `#2A2250`, Text `#EDEDEF` | `#EEE9FE`, Text `#17171A` |
| Zeitstempel | `--text-muted`, 13 px Mono | wie Dark |
| Bubble-Radius | 14 px, auf der Sprecherseite 4 px | wie Dark |

- Heidis Nachrichten tragen ein Funkeln-Icon in `--accent` und das Badge **„KI"**.
- Vom Team gesendete Nachrichten zeigen die Initialen des Mitarbeiters.
- Auswahlknöpfe (Terminbuchung) als vollbreite Buttons unter der Bubble, Rahmen
  `--border-strong`, Text `--accent-soft`.

## Diagramme

- **Punkt-Matrix** wie im Prototyp: 42 Spalten, 14 Reihen, Punkt 15 px hoch, Radius 2,
  Lücke 3 px, Höhe 252 px. Belegt `--accent`, unbelegt `--accent-off`.
- Achsenbeschriftungen in Geist Mono 13 px, `--text-muted`.
- Serienwechsel über Chips mit farbigem Quadrat (16 px, Radius 4).
- **Heatmap „Wann schreiben Kunden?"** nutzt dieselbe Punktlogik: 7 Zeilen (Wochentage) ×
  24 Spalten (Stunden), Intensität über Deckkraft von `--accent` (10 % → 100 %).
- Jedes Diagramm braucht `role="img"` und ein `aria-label`, das den Verlauf in Worten sagt.

## Barrierefreiheit

- Fokusring: 2 px `--accent`, 2 px Abstand — nie entfernen
- Dekorative SVGs `aria-hidden="true"`, Icon-Buttons immer mit `aria-label`
- Sichtbar verborgene Labels statt fehlender Labels (`position:absolute;left:-9999px`)
- Status wird nie nur über Farbe transportiert — immer Punkt **und** Wort

## Referenz-Prototyp

`HeidiDark.dc.html` aus dem Claude-Design-Export. Referenz für Werte und Layout, **kein**
Produktionscode — Komponenten werden in React/Tailwind/shadcn neu gebaut.
