# Heidi — Starterprompt

> **Das hier ist deine Arbeitsanweisung. Lies sie zuerst und halte dich daran.**
> Du baust an Heidi weiter, einem White-Label-KI-Assistenten für WhatsApp.
> Anbieter ist AWSMD (Deutschland), die Domain ist heidi-hilft.de.

## Dein erster Schritt

**Lies die Dateien aus der Tabelle unten, bevor du irgendetwas anderes tust.** Öffne sie
tatsächlich im Repository — rate ihren Inhalt nicht aus den Dateinamen.

Antworte danach zuerst mit einer kurzen Bestätigung: welche Dateien du gelesen hast, auf
welchem Stand das Projekt ist und was du als nächsten Schritt vorschlägst. Erst wenn das
bestätigt ist, fängst du an zu bauen.

Findest du eine der Dateien nicht, sag das, statt ohne sie weiterzumachen. Besonders ohne
`docs/design-system.md` darfst du keine Oberfläche bauen — dann fehlen dir alle Farbwerte,
und erfundene sind schlimmer als gar keine.

## Diese Dateien gehören zusammen

| Datei | Inhalt |
|-------|--------|
| `docs/v0/00-START-HIER.md` | diese Datei: Regeln und Arbeitsweise |
| `docs/v0/01-PRODUKT.md` | was Heidi ist, Rollen, Roadmap, MVP-Ziel |
| `docs/v0/02-TECHNIK.md` | Stack, Datenbankschema, Zugriffsregeln, Routen, Einrichtung, Fallstricke |
| `docs/PRD.md` | das vollständige Produktdokument |
| `docs/design-system.md` | **verbindliches Design-System**, Farben hell und dunkel, Typografie, Maße |
| `docs/environment.md` | Umgebungsvariablen |
| `docs/supabase-setup.md` | Einstellungen im Supabase-Dashboard |
| `features/INDEX.md` | alle Features mit Status und Abhängigkeiten |
| `features/PROJ-*.md` | die einzelnen Feature-Specs |

Hast du keinen Zugriff auf das Repository, brauchst du mindestens diese vier Dateien als
Text: `00-START-HIER.md`, `01-PRODUKT.md`, `02-TECHNIK.md` und `docs/design-system.md`.

## Die zehn Regeln

Diese Regeln sind nicht verhandelbar. Wenn eine Anforderung ihnen widerspricht, sag das,
statt sie still zu umgehen.

**1. Mandantentrennung gehört in die Datenbank, nicht in die Anwendung.**
Jede Tabelle mit Kundendaten trägt `tenant_id` und hat aktive Zeilen-Zugriffsregeln (RLS).
Verlass dich nie darauf, dass eine Abfrage richtig filtert — eine vergessene Bedingung wäre
ein Datenschutzvorfall über Kundengrenzen hinweg. Das genaue Muster steht in `02-TECHNIK.md`.

**2. Keine Branchenannahmen.**
Heidi ist branchenunabhängig. Fahrschulen sind der Markteinstieg, nicht die Grenze. In der
Oberfläche heißt es „Betrieb", nie „Fahrschule". Branchenspezifisches gehört in die
Wissensbasis eines Betriebs, niemals ins Datenmodell, in Aufzählungstypen oder in
Oberflächentexte. Prüfe bei jedem Feld: Gilt das auch für einen Friseursalon?

**3. Alles auf Deutsch.**
Oberfläche, Fehlermeldungen, E-Mails. Endkunden werden geduzt. Code, Dateinamen und
Commit-Botschaften dürfen englisch sein, aber Kommentare in dieser Codebasis sind deutsch —
bleib dabei, damit es einheitlich ist.

**4. shadcn/ui zuerst.**
Die Komponenten in `src/components/ui/` sind gesetzt. Baue nie eine eigene Version von
etwas, das dort schon liegt. Fehlt eine Komponente: `npx shadcn@latest add <name> --yes`.

**5. Das Design-System ist verbindlich.**
`docs/design-system.md` enthält Farben für hell **und** dunkel, Typografie, Radien,
Abstände und den Chat-Stil. Keine erfundenen Farbwerte, keine abweichenden Radien. Die
Akzentfarbe ist Violett `#7356F1` — auf hellem Grund gilt für Text `#5F43DD`, weil `#7356F1`
dort nur 4,6:1 Kontrast hat.

**6. Der Dienstschlüssel bleibt auf dem Server.**
`SUPABASE_SERVICE_ROLE_KEY` umgeht alle Zugriffsregeln. Niemals mit `NEXT_PUBLIC_`
präfixen, niemals in einer Client-Komponente importieren, niemals in ein Log schreiben.
Er wird nur für zwei Dinge gebraucht: einen Betrieb anlegen und einen Nutzer einladen.

**7. Keine Nachrichteninhalte in Logs oder Benachrichtigungen.**
Fehlerprotokolle enthalten Fehlercodes und Kennungen, keine Texte, Namen oder
Telefonnummern von Endkunden. Benachrichtigungs-E-Mails enthalten einen Link ins
Postfach, nicht den Inhalt.

**8. Heidi erfindet nichts.**
Sie antwortet ausschließlich aus der Wissensbasis des jeweiligen Betriebs — das ist eine
Vorgabe von Meta für WhatsApp-Business-Lösungen, kein Geschmacksurteil. Bei Unsicherheit
übergibt sie ans Team, statt zu raten. Im ersten Kontakt gibt sie sich als KI zu erkennen
(EU AI Act).

**9. Geschrieben ist nicht geprüft.**
Zugriffsregeln gelten erst als fertig, wenn ihre SQL-Prüfungen gegen eine echte Datenbank
gelaufen sind. Zwei der drei schwersten Fehler in diesem Projekt waren beim Lesen des Codes
unsichtbar — siehe „Fallstricke" in `02-TECHNIK.md`.

**10. Sag, was nicht geprüft ist.**
Wenn du etwas gebaut, aber nicht ausgeführt hast, schreib das hin. Lieber eine ehrliche
Lücke als eine stillschweigende Annahme.

## Wie du arbeitest

### Features haben Nummern

Jede Arbeit gehört zu einem Feature `PROJ-N` aus `features/INDEX.md`. Gibt es für etwas
noch keine Nummer, lege erst einen Eintrag an, bevor du baust.

Commit-Format: `feat(PROJ-7): Gesprächsliste mit Filtern`
Typen: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.

### Statusfolge

`Roadmap → Planned → Architected → In Progress → In Review → Approved → Deployed`

Der Status steht an zwei Stellen und muss übereinstimmen: im Kopf der Spec
(`features/PROJ-N-*.md`) und in der Tabelle in `features/INDEX.md`.

### Eine Spec entsteht vor dem Code

Bevor du ein Feature baust, muss `features/PROJ-N-name.md` existieren und enthalten:

- **User Stories** — mindestens drei, in der Form „Als *Rolle* möchte ich *X*, damit *Y*"
- **Out of Scope** — was ausdrücklich **nicht** dazugehört, mit Verweis auf die Features,
  die es abdecken. Ohne diesen Abschnitt baut man zu viel oder zu wenig
- **Akzeptanzkriterien** im Format
  `Angenommen [Vorbedingung], wenn [Aktion], dann [Ergebnis]`
  Jedes Kriterium muss testbar sein. Fehlerfälle und leere Zustände gehören dazu
- **Edge Cases** — mindestens drei konkrete: gleichzeitige Änderungen, Netzausfall,
  entzogene Berechtigung mitten in der Sitzung
- **Decision Log** — jede bewusste Entscheidung mit Begründung und Datum. Nicht *was*
  entschieden wurde, sondern *warum*. Das ist der Teil, der in sechs Monaten zählt
- **Open Questions** — alles Ungeklärte als `- [ ]`

Orientier dich an `features/PROJ-1-supabase-infrastruktur-mandantenfaehigkeit.md`.
Die ist vollständig und zeigt das Format.

### Du pflegst die Dokumente selbst

**Das ist der wichtigste Teil dieser Anweisung.** Es gibt hier niemanden, der die
Dokumentation hinter dir aufräumt.

Nach jeder Arbeit an einem Feature:

1. **Status** in der Spec und in `features/INDEX.md` nachziehen
2. **Implementation Notes** in die Spec schreiben: was gebaut wurde, was anders kam als
   geplant, und warum
3. **Decision Log** ergänzen, sobald du eine Entscheidung triffst, die jemand später
   hinterfragen könnte
4. **Open Questions** schließen (`- [x]` mit Antwort und Datum) oder neue aufnehmen

Wenn sich etwas Grundsätzliches ändert, ändere auch die übergeordneten Dokumente:

| Was sich ändert | Welche Datei du anpasst |
|-----------------|--------------------------|
| Produktumfang, Zielgruppe, Preis, Nicht-Ziele | `docs/PRD.md` |
| Neue oder geänderte Farbe, Schrift, Abstand, Komponentenregel | `docs/design-system.md` |
| Neue Umgebungsvariable | `docs/environment.md` |
| Neue Einstellung im Supabase-Dashboard | `docs/supabase-setup.md` |
| Neues Feature, geänderte Abhängigkeit, geänderte Priorität | `features/INDEX.md` |
| Technische Grundentscheidung, neuer Fallstrick | `docs/v0/02-TECHNIK.md` |

Ein Dokument, das nicht mehr stimmt, ist schlimmer als keines — es führt in die Irre.
Wenn du etwas entdeckst, das der Dokumentation widerspricht, korrigiere die Dokumentation
und schreib dazu, was du vorgefunden hast.

### Vor jedem „fertig"

- [ ] `npm run build` läuft fehlerfrei
- [ ] `npm test` ist grün
- [ ] Bei Datenbankänderungen: `./scripts/db-apply.sh --with-tests` ist grün
- [ ] Jede neue Tabelle hat RLS und eine SQL-Prüfung, die die Trennung belegt
- [ ] Spec und `features/INDEX.md` sind aktualisiert
- [ ] Du hast benannt, was du **nicht** geprüft hast

### Wann du nachfragst

Frag nach, statt zu raten, wenn eine Entscheidung ansteht, die sich schlecht
zurücknehmen lässt: Datenmodell, Zugriffsregeln, Preismodell, etwas mit personenbezogenen
Daten, oder die Wahl eines externen Dienstes. Eine Frage kostet eine Minute, eine
Datenmigration kostet einen Tag.

Stell **eine** Frage auf einmal und schlag eine Antwort vor, die der Nutzer bestätigen
oder korrigieren kann.

## Was gerade ansteht

PROJ-1 (Fundament, Anmeldung, Mandantentrennung) ist gebaut und läuft gegen eine echte
Datenbank. Der nächste Schritt ist **PROJ-2: Design-System & App-Shell** — die Oberfläche
von PROJ-1 ist bewusst schlicht gehalten und wartet darauf.

Den genauen Stand und die offenen Punkte findest du in `01-PRODUKT.md` und in der Spec
von PROJ-1.
