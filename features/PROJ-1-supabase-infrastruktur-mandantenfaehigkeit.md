# PROJ-1: Supabase-Infrastruktur & Mandantenfähigkeit

## Status: Planned
**Created:** 2026-11-25
**Last Updated:** 2026-11-25
**Priorität:** P0 (MVP)

## Dependencies
- None — dies ist das Fundament. PROJ-3, PROJ-4, PROJ-5, PROJ-10 und alle späteren
  Features hängen davon ab.

## Ziel in einem Satz

Ein Nutzer meldet sich per Magic Link an, landet im richtigen Kunden-Mandanten und sieht
ausschließlich dessen Daten — technisch erzwungen, nicht nur in der Oberfläche gefiltert.

## Rollenmodell

| Rolle | Ebene | Darf |
|-------|-------|------|
| `platform_admin` | über allen Mandanten (AWSMD) | Mandanten anlegen und sperren, Metriken und technische Fehler aller Mandanten sehen, zwischen Mandanten wechseln. **Keine** Gesprächsinhalte, Kontaktnamen oder Telefonnummern. |
| `tenant_admin` | ein Mandant | Alles innerhalb seines Mandanten: Wissen pflegen, Gespräche sehen, Team verwalten, Support-Einblick für AWSMD freigeben. |
| `tenant_member` | ein Mandant | Gespräche sehen und übernehmen. Keine Teamverwaltung, keine Freigabe von Support-Einblick. |

Ein Nutzerkonto kann Mitgliedschaften in **mehreren** Mandanten haben, je mit eigener Rolle
(n:m). `platform_admin` ist keine Mitgliedschaft, sondern eine Eigenschaft des Kontos.

## User Stories

- Als **AWSMD-Admin** möchte ich einen neuen Kunden-Mandanten anlegen und den ersten
  Kunden-Admin einladen, damit ein neuer Kunde starten kann.
- Als **AWSMD-Admin** möchte ich zwischen Mandanten wechseln können, ohne mich neu
  anzumelden, damit ich mehrere Kunden betreuen kann.
- Als **AWSMD-Admin** möchte ich darauf vertrauen können, dass ich die Nachrichteninhalte
  meiner Kunden nicht einsehen kann, damit ich das im AVV und im Verkaufsgespräch
  zusichern kann.
- Als **Kunden-Admin** möchte ich mich ohne Passwort über einen Link in meiner E-Mail
  anmelden, damit ich mir kein weiteres Passwort merken muss.
- Als **Kunden-Admin** möchte ich AWSMD befristeten Einblick in meine Gespräche gewähren
  können, damit ein Supportfall gelöst werden kann, ohne dauerhaft Daten zu öffnen.
- Als **Kunden-Mitarbeiter**, der in zwei Fahrschulen arbeitet, möchte ich mit einer
  E-Mail-Adresse auf beide zugreifen und oben umschalten können.
- Als **Kunden-Admin** möchte ich sicher sein, dass ein Mitarbeiter einer anderen Fahrschule
  meine Daten unter keinen Umständen sehen kann — auch nicht über einen manipulierten Link.

## Out of Scope

- **Oberfläche zur Nutzer- und Kundenverwaltung** (Listen, Formulare, Rollen ändern,
  Einladungen erneut senden) → PROJ-3. PROJ-1 liefert nur die Datenstruktur, die
  Anmeldung und ein Anlegen von Mandant und erstem Admin über ein Skript oder einen
  minimalen Admin-Zugang.
- **Design-System, Sidebar, Topbar und Theme-Umschaltung** → PROJ-2. PROJ-1 nutzt eine
  schlichte, funktionale Oberfläche; der Mandantenwechsler wird in PROJ-2 gestaltet.
- **Fachtabellen** für Wissensbasis (PROJ-4), Nachrichten und Gespräche (PROJ-5/6/7),
  Termine (PROJ-12). PROJ-1 legt nur die Konvention fest, nach der jede dieser Tabellen
  gebaut wird.
- **AVV-Zustimmung, Löschkonzept, Aufbewahrungsfristen, Auskunft pro Kontakt** → PROJ-10.
  PROJ-1 liefert das Zugriffsprotokoll als technische Grundlage dafür.
- **Stripe-Abo und Self-Service-Registrierung** → PROJ-11. Im MVP legt AWSMD Mandanten an.
- **Passwort-Anmeldung, 2FA, SSO, SAML** — bewusst nicht im MVP.
- **Sperren eines Mandanten wegen ausgebliebener Zahlung** → PROJ-11. PROJ-1 kennt nur
  den Status „aktiv / gesperrt" und sein Verhalten.
- **Rechteverwaltung feiner als die drei Rollen** (z. B. „darf Wissen lesen, nicht
  schreiben") — bewusst nicht im MVP.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anmeldung

- [ ] Angenommen eine E-Mail-Adresse gehört zu einem Nutzer mit mindestens einer Mitgliedschaft, wenn der Nutzer sie auf der Anmeldeseite einträgt und abschickt, dann erhält er eine E-Mail mit Anmeldelink und die Seite bestätigt den Versand
- [ ] Angenommen der Nutzer hat einen gültigen Anmeldelink erhalten, wenn er ihn innerhalb der Gültigkeitsdauer öffnet, dann ist er angemeldet und landet in seinem Mandanten
- [ ] Angenommen ein Anmeldelink wurde bereits verwendet, wenn der Nutzer ihn erneut öffnet, dann erscheint der Hinweis, dass der Link verbraucht ist, und die Anmeldeseite mit der Möglichkeit, einen neuen anzufordern
- [ ] Angenommen ein Anmeldelink ist abgelaufen, wenn der Nutzer ihn öffnet, dann erscheint der Hinweis, dass der Link abgelaufen ist, samt Möglichkeit, einen neuen anzufordern
- [ ] Angenommen eine E-Mail-Adresse ist im System unbekannt, wenn sie auf der Anmeldeseite eingetragen wird, dann zeigt die Seite dieselbe Bestätigung wie bei einer bekannten Adresse und es wird keine E-Mail versendet
- [ ] Angenommen ein Nutzer ist angemeldet, wenn er „Abmelden" wählt, dann wird die Sitzung beendet und er landet auf der Anmeldeseite
- [ ] Angenommen ein Nutzer fordert innerhalb von 60 Sekunden mehr als drei Anmeldelinks an, wenn er einen weiteren anfordert, dann wird er abgewiesen mit dem Hinweis, es später erneut zu versuchen

### Mandantenzuordnung und Wechsel

- [ ] Angenommen ein Nutzer hat genau eine Mitgliedschaft, wenn er sich anmeldet, dann landet er direkt in diesem Mandanten und es wird kein Wechsler angezeigt
- [ ] Angenommen ein Nutzer hat mehrere Mitgliedschaften, wenn er sich anmeldet, dann landet er im zuletzt genutzten Mandanten und der Wechsler zeigt alle seine Mandanten
- [ ] Angenommen ein Nutzer hat mehrere Mitgliedschaften und war noch nie angemeldet, wenn er sich anmeldet, dann landet er im alphabetisch ersten Mandanten
- [ ] Angenommen ein Nutzer ist in Mandant A, wenn er im Wechsler Mandant B wählt, dann zeigen alle Ansichten die Daten von Mandant B und seine dortige Rolle gilt
- [ ] Angenommen ein Nutzer hat gar keine Mitgliedschaft und ist kein Plattform-Admin, wenn er sich anmeldet, dann erscheint eine erklärende Seite („noch keinem Betrieb zugeordnet") statt einer leeren Anwendung
- [ ] Angenommen ein Nutzer ist Plattform-Admin, wenn er sich anmeldet, dann sieht er die Mandantenübersicht und kann jeden Mandanten im Wechsler auswählen

### Mandantentrennung (die Kernanforderung)

- [ ] Angenommen ein Datensatz gehört zu Mandant A, wenn ein Nutzer ohne Mitgliedschaft in A ihn über die Datenbankschnittstelle abfragt, dann liefert die Datenbank kein Ergebnis — unabhängig davon, was die Oberfläche filtert
- [ ] Angenommen ein Nutzer kennt die Kennung eines Datensatzes aus Mandant B, wenn er sie als Mitglied von Mandant A direkt in der Adresszeile aufruft, dann erhält er „nicht gefunden" und keinen Inhalt
- [ ] Angenommen ein Nutzer legt in Mandant A einen Datensatz an, wenn er dabei eine fremde Mandanten-Kennung mitschickt, dann weist die Datenbank das Schreiben ab
- [ ] Angenommen eine neue Tabelle wird angelegt, wenn sie keine aktive Zeilen-Zugriffsregel besitzt, dann schlägt die automatisierte Prüfung im Test fehl
- [ ] Angenommen einem Nutzer wird die Mitgliedschaft in Mandant A entzogen, wenn er eine bestehende offene Sitzung weiter nutzt, dann verliert er beim nächsten Zugriff den Zugang zu Mandant A

### Rollen

- [ ] Angenommen ein Nutzer ist `tenant_member`, wenn er die Teamverwaltung aufruft, dann wird ihm der Zugriff verweigert
- [ ] Angenommen ein Nutzer ist `tenant_member`, wenn er versucht, Support-Einblick freizugeben, dann wird die Aktion abgewiesen
- [ ] Angenommen ein Nutzer ist `tenant_admin` in Mandant A und `tenant_member` in Mandant B, wenn er nach B wechselt, dann stehen ihm dort nur die Rechte eines Mitarbeiters zu
- [ ] Angenommen ein Nutzer ist der letzte `tenant_admin` eines Mandanten, wenn er sich selbst die Admin-Rolle entziehen will, dann wird die Aktion mit einem Hinweis abgelehnt

### Einblick des Plattform-Admins

- [ ] Angenommen ein Plattform-Admin betrachtet einen Mandanten ohne freigegebenen Einblick, wenn er das Gesprächs-Postfach aufruft, dann sieht er Anzahl und Kennzahlen, aber keine Nachrichtentexte, Kontaktnamen oder Telefonnummern
- [ ] Angenommen ein `tenant_admin` gibt Support-Einblick frei, wenn er die Freigabe bestätigt, dann gilt sie 24 Stunden, ist im Kundenkonto sichtbar und der Plattform-Admin sieht in dieser Zeit die Inhalte dieses Mandanten
- [ ] Angenommen eine Support-Freigabe läuft ab, wenn der Plattform-Admin danach erneut Inhalte aufruft, dann sieht er wieder nur Kennzahlen
- [ ] Angenommen eine Support-Freigabe ist aktiv, wenn der `tenant_admin` sie vorzeitig widerruft, dann endet der Einblick sofort
- [ ] Angenommen ein Plattform-Admin greift während einer Freigabe auf Inhalte zu, wenn der Zugriff erfolgt, dann wird er im Zugriffsprotokoll mit Zeitpunkt, Konto und betroffenem Bereich festgehalten
- [ ] Angenommen ein `tenant_admin` öffnet das Zugriffsprotokoll, wenn Zugriffe durch AWSMD vorliegen, dann sieht er sie vollständig und kann sie nicht löschen

### Mandantenstatus

- [ ] Angenommen ein Mandant ist gesperrt, wenn ein Mitglied sich anmeldet, dann erscheint ein Hinweis auf die Sperrung und kein Zugriff auf Daten
- [ ] Angenommen ein Mandant ist gesperrt, wenn eine WhatsApp-Nachricht für ihn eingeht, dann wird sie entgegengenommen und gespeichert, aber nicht beantwortet

### Datenhaltung

- [ ] Angenommen das Supabase-Projekt wird angelegt, wenn die Region geprüft wird, dann ist sie `eu-central-1` (Frankfurt)
- [ ] Angenommen ein Fehler tritt auf, wenn er protokolliert wird, dann enthält das Protokoll keine Nachrichteninhalte, Namen oder Telefonnummern von Endkunden

## Edge Cases

- **Mitgliedschaft wird während einer offenen Sitzung entzogen** → der Zugriff endet beim
  nächsten Datenzugriff, nicht erst beim nächsten Login. Der Nutzer sieht eine Erklärung,
  keinen Fehler.
- **Nutzer ist in zwei Mandanten, einer davon wird gesperrt** → er bleibt im anderen voll
  arbeitsfähig; der gesperrte erscheint im Wechsler als gesperrt markiert.
- **Dieselbe E-Mail wird für einen zweiten Mandanten eingeladen** → es entsteht kein
  zweites Konto, sondern eine zweite Mitgliedschaft am bestehenden Konto.
- **Anmeldelink wird in einem anderen Browser geöffnet** als dem, in dem er angefordert
  wurde → die Anmeldung funktioniert; der Link ist an das Konto gebunden, nicht an das Gerät.
- **Anmelde-E-Mail landet im Spam oder kommt nicht an** → die Seite nennt nach dem Versand
  ausdrücklich den Spam-Ordner und erlaubt nach 60 Sekunden einen erneuten Versand.
- **Support-Freigabe läuft ab, während der Plattform-Admin gerade liest** → der nächste
  Datenabruf liefert keine Inhalte mehr; die Oberfläche erklärt, dass die Freigabe endete,
  statt eine leere Liste zu zeigen.
- **Plattform-Admin ist gleichzeitig Mitglied eines Mandanten** (z. B. zum Testen) → in
  diesem Mandanten gilt seine Mitgliedschaftsrolle; der eingeschränkte Inhaltszugriff
  greift dort nicht, und das Zugriffsprotokoll weist ihn als Mitglied aus.
- **Gleichzeitiger Rollenwechsel durch zwei Admins** → der letzte Schreibvorgang gewinnt,
  die Regel „mindestens ein `tenant_admin` pro Mandant" wird dabei in der Datenbank
  erzwungen, nicht nur in der Oberfläche.
- **Datenbank nicht erreichbar beim Login** → der Nutzer sieht eine Störungsmeldung und
  seine eingegebene E-Mail bleibt im Feld stehen.
- **Direkter Aufruf eines geschützten Bereichs ohne Anmeldung** → Weiterleitung zur
  Anmeldung; nach erfolgreicher Anmeldung landet der Nutzer auf der ursprünglich
  gewünschten Seite.

## Technical Requirements

- **Region:** Supabase `eu-central-1` (Frankfurt). Kein personenbezogenes Datum verlässt
  die EU.
- **Mandantentrennung:** auf Datenbankebene erzwungen (Zeilen-Zugriffsregeln), nicht in
  der Anwendungsschicht. Automatisierter Test, der für jede Tabelle prüft, dass die
  Regeln aktiv sind.
- **Sicherheit:** Jeder Zugriff auf Daten eines Mandanten erfordert eine Anmeldung. Der
  Dienstschlüssel der Datenbank wird ausschließlich serverseitig verwendet und nie an den
  Browser ausgeliefert.
- **Protokollierung:** Zugriffsprotokoll ist nur anfügbar — Einträge können nicht geändert
  oder gelöscht werden, auch nicht von AWSMD.
- **Antwortzeit:** Seitenaufbau nach Anmeldung unter 1 s, Mandantenwechsel unter 500 ms.
- **Browser:** aktuelle Versionen von Chrome, Safari, Firefox und Edge; Oberfläche
  bedienbar ab 375 px Breite.
- **Tests:** Mandantentrennung und Rollengrenzen werden durch automatisierte Tests
  abgedeckt — mindestens ein Test pro „verweigert"-Kriterium oben.

## Open Questions

- [ ] Gültigkeitsdauer des Anmeldelinks: 60 Minuten (Supabase-Standard) oder kürzer? Zu kurz ist im Büroalltag lästig, zu lang ist ein Risiko bei geteilten Postfächern.
- [ ] Sitzungsdauer bis zur erneuten Anmeldung: 30 Tage bequem, 7 Tage sicherer — was passt zum Fahrschulbüro?
- [ ] Über welchen Dienst gehen die Anmelde-E-Mails? Supabase-Standardversand reicht für den Pilot, braucht aber für Zustellraten und eigenen Absender später einen EU-Dienst (Entscheidung gehört zu PROJ-8, betrifft aber schon hier die Zustellung).
- [ ] Darf ein `tenant_admin` einen Mitarbeiter wieder entfernen, dessen Chats noch offen sind — oder muss er die Gespräche vorher übergeben? (Berührt PROJ-7.)
- [ ] Braucht das Zugriffsprotokoll eine eigene Aufbewahrungsfrist, oder gilt die allgemeine aus PROJ-10?

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Nutzer ↔ Mandant als n:m-Mitgliedschaft, nicht `tenant_id` am Nutzer | Filialen und Verbünde sind bei Fahrschulen verbreitet, und Mitarbeiter arbeiten für mehrere Betriebe. Eine Tabelle mehr jetzt gegen eine schmerzhafte Migration später | 2026-11-25 |
| `platform_admin` ist eine Konto-Eigenschaft, keine Mitgliedschaft | AWSMD steht über allen Mandanten; als Mitgliedschaft müsste bei jedem neuen Kunden ein Eintrag mitgepflegt werden | 2026-11-25 |
| Plattform-Admin sieht standardmäßig keine Gesprächsinhalte | AWSMD ist Auftragsverarbeiter, nicht Eigentümer der Daten. Technisch erzwungene Zurückhaltung ist im AVV sauber und im Verkaufsgespräch ein Argument statt einer Erklärungsnot | 2026-11-25 |
| Support-Einblick befristet auf 24 h, durch den Kunden freigegeben, protokolliert, nicht löschbar | Supportfälle brauchen den konkreten Fall; anonymisierte Verläufe sind dafür nutzlos. Die Befristung macht die Ausnahme zur Ausnahme | 2026-11-25 |
| Magic Link statt Passwort | Kein Zurücksetzen, keine schwachen Passwörter, keine 2FA-Entscheidung im MVP — und die Einladung neuer Mitarbeiter ist derselbe Mechanismus | 2026-11-25 |
| Unbekannte E-Mail erhält dieselbe Bestätigung wie eine bekannte | Sonst verrät die Anmeldeseite, welche Adressen Kunden sind | 2026-11-25 |
| Nur drei Rollen, keine feingranularen Rechte | Eine Fahrschule hat zwei bis acht Mitarbeiter. Feine Rechte sind Verwaltungsaufwand ohne Nutzen auf dieser Größe | 2026-11-25 |
| Fachtabellen entstehen mit ihrem Feature, nicht hier | Schema-Entscheidungen zu Gesprächen und Wissen brauchen die Anforderungen aus PROJ-4 bis PROJ-7. Vorwegnehmen führt zu mehr Umbau, nicht weniger | 2026-11-25 |
| Mandantentrennung in der Datenbank, nicht in der Anwendung | Ein vergessener Filter in einer Abfrage wäre ein Datenschutzvorfall über Kundengrenzen. Die Datenbank verzeiht Vergessen, die Anwendung nicht | 2026-11-25 |
| Gesperrter Mandant nimmt Nachrichten an, antwortet aber nicht | Nachrichten zu verwerfen wäre Datenverlust beim Kunden; zu antworten wäre Leistung ohne Vertrag | 2026-11-25 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
