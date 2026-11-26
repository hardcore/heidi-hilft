# PROJ-2: Design-System & App-Shell

## Status: Planned
**Created:** 2026-11-25
**Last Updated:** 2026-11-26 (Spec geschrieben)
**Priorität:** P0 (MVP)

## Dependencies
- Keine harte Abhängigkeit. Setzt auf der Oberfläche von PROJ-1 auf (Layout des
  geschützten Bereichs, Mandantenwechsler, Abmelden, Hinweisseiten) und ersetzt deren
  schlichte Gestaltung.
- PROJ-3, PROJ-4, PROJ-7 und PROJ-9 hängen hiervon ab: sie bauen ihre Seiten in die Hülle
  und mit den Token dieses Features.

## Ziel in einem Satz

Jede Seite von Heidi sieht in hell und dunkel aus wie im Prototyp, folgt dabei dem System
des Geräts, und neue Features bekommen eine fertige Hülle, in die sie nur noch ihren
Inhalt stellen.

## Was dieses Feature liefert

1. **Token** aus `docs/design-system.md` als CSS-Variablen für `:root` (hell) und `.dark`,
   gemappt auf die shadcn-Variablen, damit die vorhandenen Komponenten in
   `src/components/ui/` ohne Nachbau richtig aussehen
2. **Schriften** Inter und Geist Mono, Typografie-Rollen als wiederverwendbare Klassen
3. **Theme-Umschaltung** Hell / Dunkel / System, Voreinstellung System
4. **App-Hülle** nach Prototyp: äußere Fläche, Hülle mit Radius 34, Sidebar, Hauptpanel mit
   Kopfzeile, optionales rechtes Rail
5. **Navigation** mit Mono-Gruppenüberschriften, nach Rolle gefiltert
6. **Betriebskarte** unten in der Sidebar mit Kürzel und Name; bei mehreren Betrieben ist
   sie der Mandantenwechsler
7. **Nutzermenü** mit Theme-Wahl und Abmelden
8. **Mobile Ansicht** ab 375 px: Sidebar als ausklappbares Menü
9. Die vorhandenen Seiten aus PROJ-1 (`/`, `/verwaltung/betriebe`, `/einstellungen/zugriff`,
   `/anmelden`, `/kein-betrieb`, `/betrieb-gesperrt`) auf das neue System umgestellt

## User Stories

- Als **Kunden-Mitarbeiter** möchte ich, dass Heidi automatisch hell oder dunkel erscheint,
  je nachdem, wie mein Gerät eingestellt ist, damit ich abends am Handy nicht geblendet werde.
- Als **Kunden-Admin** möchte ich das Erscheinungsbild unabhängig vom System fest auf hell
  oder dunkel stellen können, damit es zu meinem Arbeitsplatz passt.
- Als **Kunden-Admin**, der für zwei Betriebe arbeitet, möchte ich unten in der Sidebar auf
  einen Blick sehen, in welchem Betrieb ich gerade bin, und von dort wechseln können, damit
  ich nicht versehentlich im falschen Betrieb arbeite.
- Als **Kunden-Mitarbeiter** möchte ich in der Navigation nur sehen, was ich auch öffnen
  darf, damit ich nicht auf Seiten klicke, die mich abweisen.
- Als **Kunden-Mitarbeiter** möchte ich Heidi am Handy genauso bedienen können wie am
  Schreibtisch, damit ich eine Übergabe auch unterwegs annehmen kann.
- Als **AWSMD-Admin** möchte ich in der Navigation einen eigenen Bereich für die
  Plattform-Verwaltung sehen, der für Kunden nicht existiert, damit klar ist, in welcher
  Rolle ich gerade handle.
- Als **Entwickler eines späteren Features** möchte ich eine fertige Hülle und fertige Token
  vorfinden, damit ich keine Farben erfinde und jede Seite gleich aufgebaut ist.

## Out of Scope

- **Inhalte des rechten Rails „Frag Heidi"** → PROJ-15. PROJ-2 liefert nur den Platz im
  Layout, der leer bleibt und ausgeblendet ist, solange keine Seite ihn füllt.
- **Diagramme** (Punkt-Matrix, Heatmap) → PROJ-9. Die Token `--accent-off` usw. werden hier
  angelegt, die Diagramm-Bausteine nicht.
- **Chat-Bubbles im WhatsApp-Stil** → PROJ-7. Token für Chat-Hintergrund und Bubbles werden
  hier angelegt, die Bausteine nicht.
- **Navigationseinträge für noch nicht gebaute Features** (Postfach, Wissen & FAQ,
  Dashboard, Termine, Vorlagen, Kontakte …) → jeweils mit ihrem Feature. Die Navigation
  zeigt nur Seiten, die es gibt — keine toten Links, keine „bald verfügbar"-Einträge.
- **Benachrichtigungsglocke und Badge „Offene Übergaben"** → PROJ-8.
- **Globale Suche mit ⌘K** → später, sobald es durchsuchbare Inhalte gibt (frühestens
  PROJ-4/PROJ-7). Ohne Inhalte wäre das Feld eine Attrappe.
- **Tarif-Badge** („Pro") aus dem Prototyp → es gibt im Datenmodell keinen Tarif; frühestens
  PROJ-11.
- **White-Label-Gestaltung pro Betrieb** (eigenes Logo, eigene Akzentfarbe) → nicht im MVP.
  „Gebrandet" heißt im MVP: Name und Kürzel des Betriebs, nicht eigene Farben.
- **Teamverwaltung und Betriebsverwaltung über das hinaus, was PROJ-1 schon kann** → PROJ-3.
  PROJ-2 stellt die vorhandenen Seiten nur auf das neue Aussehen um.
- **Reparatur von `npm run lint`** → eigener Aufräum-Eintrag, nicht Teil dieses Features.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Theme

- [ ] Angenommen das Gerät steht auf dunkel und der Nutzer hat nichts gewählt, wenn er eine beliebige Seite öffnet, dann erscheint sie dunkel — ohne dass vorher kurz die helle Fassung aufblitzt
- [ ] Angenommen das Gerät steht auf hell und der Nutzer hat nichts gewählt, wenn er eine beliebige Seite öffnet, dann erscheint sie hell
- [ ] Angenommen der Nutzer steht auf „System", wenn er die Systemeinstellung bei geöffneter Seite umstellt, dann wechselt Heidi ohne Neuladen mit
- [ ] Angenommen der Nutzer wählt im Nutzermenü „Dunkel", wenn er die Seite neu lädt oder eine andere Seite öffnet, dann bleibt sie dunkel, auch wenn das Gerät auf hell steht
- [ ] Angenommen der Nutzer wählt „System", wenn er danach die Seite neu lädt, dann folgt Heidi wieder dem Gerät
- [ ] Angenommen der Nutzer ist nicht angemeldet, wenn er `/anmelden` öffnet, dann folgt auch diese Seite dem Gerät bzw. der zuvor auf diesem Gerät gewählten Einstellung
- [ ] Angenommen eine beliebige Seite in hell oder dunkel, wenn ihre Text- und Flächenfarben geprüft werden, dann erfüllt jeder Normaltext mindestens WCAG AA (4,5:1) und violetter Text auf hellem Grund nutzt `--accent-soft`, nie `--accent`

### Hülle und Navigation

- [ ] Angenommen ein angemeldeter Nutzer ab 1024 px Breite, wenn er den geschützten Bereich öffnet, dann sieht er Sidebar und Hauptpanel innerhalb der Hülle mit den Maßen aus `docs/design-system.md` (Hülle Radius 34, Panel Radius 22, Abstand 14 px, maximale Breite 1420 px)
- [ ] Angenommen ein Nutzer ist `tenant_member`, wenn er die Navigation ansieht, dann erscheint kein Eintrag, der ihn beim Öffnen abweisen würde (z. B. „Zugriff & Support")
- [ ] Angenommen ein Nutzer ist `tenant_admin`, wenn er die Navigation ansieht, dann sieht er zusätzlich die Einstellungen für Zugriff & Support
- [ ] Angenommen ein Nutzer ist Plattform-Admin, wenn er die Navigation ansieht, dann sieht er eine eigene Gruppe „PLATTFORM" mit der Betriebsübersicht; Nutzer ohne diese Eigenschaft sehen die Gruppe nicht
- [ ] Angenommen ein Nutzer öffnet eine Seite, wenn er die Navigation ansieht, dann ist der zugehörige Eintrag als aktiv hervorgehoben (`--surface-active`) und trägt `aria-current="page"`
- [ ] Angenommen ein Nutzer bedient nur die Tastatur, wenn er mit Tab durch Sidebar, Kopfzeile und Inhalt geht, dann ist jedes bedienbare Element erreichbar und zeigt den Fokusring (2 px `--accent`, 2 px Abstand)
- [ ] Angenommen ein Nutzer mit Screenreader, wenn er die Seite betritt, dann kann er über einen „Zum Inhalt springen"-Link direkt in den Hauptbereich springen
- [ ] Angenommen eine Seite setzt einen Titel, wenn sie geöffnet wird, dann steht er in der Kopfzeile des Hauptpanels und als `<title>` im Browser-Tab („Titel · Heidi")

### Betriebskarte und Wechsel

- [ ] Angenommen ein Nutzer hat genau eine Mitgliedschaft, wenn er die Sidebar ansieht, dann zeigt die Betriebskarte Kürzel und Namen des Betriebs, ist aber kein Wechsler
- [ ] Angenommen ein Nutzer hat mehrere Mitgliedschaften, wenn er die Betriebskarte anklickt, dann öffnet sich eine Liste seiner Betriebe mit Kürzel, Name und Rolle; gesperrte sind mit Punkt **und** Wort „gesperrt" markiert
- [ ] Angenommen ein Nutzer wählt in dieser Liste einen anderen Betrieb, wenn der Wechsel erfolgreich ist, dann zeigen Karte, Navigation und Inhalt den neuen Betrieb mit der dortigen Rolle
- [ ] Angenommen der Wechsel scheitert (Netz, 403), wenn die Antwort eintrifft, dann bleibt der bisherige Betrieb angezeigt und eine Meldung nennt den Grund
- [ ] Angenommen ein Plattform-Admin ohne eigene Mitgliedschaft, wenn er die Sidebar ansieht, dann zeigt die Karte „AWSMD · Plattform" statt eines Betriebs

### Mobil

- [ ] Angenommen ein Nutzer bei 375 px Breite, wenn er den geschützten Bereich öffnet, dann ist die Sidebar eingeklappt, ein Menüknopf (44 × 44 px, `aria-label`) öffnet sie als Seitenleiste, und es gibt keinen waagrechten Bildlauf
- [ ] Angenommen die mobile Seitenleiste ist offen, wenn der Nutzer einen Eintrag wählt oder Escape drückt, dann schließt sie sich und der Fokus kehrt zum Menüknopf zurück

### Umgestellte Seiten aus PROJ-1

- [ ] Angenommen eine der Seiten `/`, `/verwaltung/betriebe`, `/einstellungen/zugriff`, wenn sie geöffnet wird, dann liegt sie in der neuen Hülle und verwendet nur Token — keine fest eingetragenen Farbwerte im Code
- [ ] Angenommen eine der öffentlichen Seiten `/anmelden`, `/kein-betrieb`, `/betrieb-gesperrt`, wenn sie geöffnet wird, dann zeigt sie eine zentrierte Karte auf `--canvas` mit Heidi-Zeichen, ohne Sidebar, in hell und dunkel
- [ ] Angenommen das Verhalten aus PROJ-1 (Zugangskontrolle, Weiterleitungen, Wechsel, Freigabe, Abmelden), wenn PROJ-2 fertig ist, dann ist es unverändert — die vorhandenen 35 Vitest-Tests bleiben grün

## Edge Cases

- **Theme-Wahl auf zwei Geräten verschieden** → jedes Gerät behält seine eigene Wahl. Die
  Einstellung ist eine Geräte-, keine Kontoeinstellung (siehe Decision Log und Open
  Questions).
- **Kein JavaScript bzw. Skript lädt nicht** → die Seite erscheint im Systemthema über
  `prefers-color-scheme`; nur die manuelle Umschaltung fehlt.
- **Mitgliedschaft wird während der Sitzung entzogen** → beim nächsten Seitenaufruf
  verschwindet der Betrieb aus der Karte; ist es der letzte, greift die Weiterleitung aus
  PROJ-1 auf `/kein-betrieb`. Die Hülle zeigt nie einen Betrieb an, den der Server nicht
  bestätigt hat.
- **Rolle wird während der Sitzung herabgestuft** (Admin → Mitarbeiter) → der
  Navigationseintrag „Zugriff & Support" verschwindet beim nächsten Seitenaufruf; wer die
  noch offene Seite weiter benutzt, wird von der Route mit 403 abgewiesen (PROJ-1). Die
  Navigation ist Komfort, nicht Schutz.
- **Wechsel in zwei Tabs gleichzeitig** → der aktive Betrieb steht im Profil, nicht im
  Browser; der zuletzt gesendete Wechsel gewinnt, der andere Tab zeigt beim nächsten
  Seitenaufruf den tatsächlichen Betrieb.
- **Netzausfall beim Wechsel** → Karte springt auf den bisherigen Betrieb zurück, Meldung
  „Der Wechsel hat nicht geklappt", kein halb gewechselter Zustand.
- **Sehr langer Betriebsname** („Physiotherapie am Stadtpark Dr. Müller-Lüdenscheidt &
  Partner") → wird in Karte und Kopfzeile mit Auslassungspunkten gekürzt, der volle Name
  steht im `title` und in der Liste.
- **Kürzel fehlt oder ist leer** (Altbestand) → die Karte bildet ersatzweise Initialen aus
  dem Namen; das Feld ist laut Schema Pflicht, die Oberfläche bricht trotzdem nicht.
- **Breite zwischen 375 und 1024 px** (Tablet) → Sidebar eingeklappt wie mobil; das rechte
  Rail wandert unter den Inhalt statt daneben.
- **Browser-Zoom 200 %** → Layout bricht nicht, Inhalte bleiben ohne waagrechten Bildlauf
  erreichbar (WCAG 1.4.10).

## Technical Requirements

- **Token-Kollision mit shadcn beachten.** `docs/design-system.md` und shadcn verwenden
  dieselben Namen mit anderer Bedeutung: `--accent` ist bei Heidi das Violett, bei shadcn
  die dezente Hover-Fläche; `--input` ist bei Heidi die Fläche des Suchfelds, bei shadcn
  der Rahmen von Eingaben; `--border` ähnlich. Die Heidi-Token werden deshalb mit eigenem
  Präfix angelegt (Vorschlag `--h-*`) und die shadcn-Variablen **daraus** abgeleitet. Ohne
  das würden alle vorhandenen shadcn-Komponenten beim Hover violett.
- **Kein Aufblitzen.** Das Theme muss vor dem ersten Zeichnen feststehen (Skript im
  `<head>`, wie `next-themes` es liefert; `next-themes` ist bereits installiert).
- **shadcn zuerst:** Sidebar (`ui/sidebar.tsx`), Sheet, DropdownMenu, Avatar, Badge,
  Tooltip sind vorhanden und werden verwendet, nicht nachgebaut.
- **Icons:** `lucide-react` (vorhanden), 19 px, `stroke-width` 1.7 in der Navigation.
- **Schriften** über `next/font` (Inter, Geist Mono), keine externen Font-Anfragen zur
  Laufzeit.
- **Keine Farbwerte in Komponenten.** Eine Prüfung (Test oder Suchlauf im Build-Schritt)
  stellt sicher, dass in `src/app` und `src/components` außerhalb von `ui/` keine
  Hex-Werte stehen.
- **Server-Daten:** Rolle, Betriebe und aktiver Betrieb kommen weiter aus
  `getSessionContext()`; die Hülle bekommt sie als Props aus dem Server-Layout.
- **Leistung:** Seitenaufbau nach Anmeldung weiterhin unter 1 s (PROJ-1), Theme-Wechsel
  ohne Neuladen.
- **Browser:** aktuelle Chrome, Safari, Firefox, Edge; bedienbar ab 375 px.

## Open Questions

- [ ] **Wo wird die Theme-Wahl gespeichert?** Vorschlag: nur im Gerät (Cookie/Local Storage
  über `next-themes`). Keine Migration nötig, wirkt schon auf der Anmeldeseite, und
  „Handy dunkel, Büro-PC hell" ist eher Wunsch als Fehler. Alternative wäre eine Spalte
  `profiles.theme` — dann folgt die Wahl dem Konto, braucht aber eine Migration und
  wirkt erst nach der Anmeldung.
- [ ] Bekommt die Sidebar einen Einklapp-Modus (nur Icons) für schmale Laptop-Bildschirme,
  oder reicht „ausgeklappt ab 1024 px, sonst Seitenleiste"? Vorschlag: zunächst ohne.
- [ ] Heißt der Navigationseintrag für die vorhandene Seite `/einstellungen/zugriff`
  „Zugriff & Support" oder „Datenschutz"? Vorschlag: „Zugriff & Support", weil er sagt, was
  man dort tut.
- [ ] Soll die Hell-Palette vor dem Bau an einem echten Bildschirm gegengeprüft werden? Sie
  ist laut `docs/design-system.md` abgeleitet, nicht aus einem Prototyp.

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Navigation zeigt nur Seiten, die es gibt | Tote Einträge erzeugen Klicks ins Leere und beim Pilotbetrieb den Eindruck einer halbfertigen Software. Jedes Feature bringt seinen Eintrag mit | 2026-11-26 |
| Navigation nach Rolle gefiltert, Schutz bleibt in Route und Datenbank | Ein Eintrag, der beim Klick abweist, ist schlechter als keiner. Ausblenden ist Komfort; die Sicherheit liegt weiter in den Schichten aus PROJ-1 | 2026-11-26 |
| Betriebskarte unten in der Sidebar ist zugleich der Wechsler | So steht im Prototyp; der aktive Betrieb ist ständig sichtbar, und der Wechsel sitzt dort, wo man nachsieht, wo man ist | 2026-11-26 |
| Kein Tarif-Badge, keine Glocke, keine Suche im MVP-Rahmen von PROJ-2 | Es gibt dafür weder Daten noch Funktion. Attrappen müssten später wieder entfernt oder erklärt werden | 2026-11-26 |
| Theme folgt standardmäßig dem System | Vorgabe aus `docs/design-system.md`; die Zielgruppe nutzt Heidi auch abends am Handy | 2026-11-26 |

### Technical Decisions
<!-- Wird mit /architecture ergänzt -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Heidi-Token mit eigenem Präfix, shadcn-Variablen daraus abgeleitet (Vorschlag) | Gleichnamige Variablen mit anderer Bedeutung (`--accent`, `--input`, `--border`) würden sonst alle shadcn-Komponenten verfärben | 2026-11-26 |
| `next-themes` für die Umschaltung (Vorschlag) | Bereits installiert, setzt die Klasse vor dem ersten Zeichnen und vermeidet das Aufblitzen | 2026-11-26 |
