# PROJ-1: Supabase-Infrastruktur & Mandantenfähigkeit

## Status: In Progress
**Created:** 2026-11-25
**Last Updated:** 2026-11-26 (Frontend gebaut, 35 Vitest- und 30 SQL-Tests grün)
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

- [x] Gültigkeitsdauer des Anmeldelinks — **entschieden am 2026-11-25: 60 Minuten**, dafür nur einmal verwendbar und mit Versandbremse.
- [x] Sitzungsdauer — **entschieden am 2026-11-25: 30 Tage, gleitend verlängert.**
- [ ] Über welchen Dienst gehen die Anmelde-E-Mails? Supabase-Standardversand reicht für den Pilot, braucht aber für Zustellraten und eigenen Absender später einen EU-Dienst (Entscheidung gehört zu PROJ-8, betrifft aber schon hier die Zustellung).
- [ ] Darf ein `tenant_admin` einen Mitarbeiter wieder entfernen, dessen Chats noch offen sind — oder muss er die Gespräche vorher übergeben? (Berührt PROJ-7.)
- [ ] Braucht das Zugriffsprotokoll eine eigene Aufbewahrungsfrist, oder gilt die allgemeine aus PROJ-10?
- [x] **Region des Supabase-Projekts** — bestätigt am 2026-11-25: Frankfurt (`eu-central-1`).
- [ ] **AVV-Kette prüfen:** Supabase wurde über den Vercel-Marketplace bezogen. Damit steht Vercel als Vertragspartner für die Datenbank in der Kette, nicht nur für das Hosting. Für die Unterauftragnehmerliste und den AVV mit Kunden ist ein direkter Supabase-Vertrag sauberer.
- [x] **SQL-Tests ausgeführt** — 2026-11-26, 28 von 28 grün gegen das echte Projekt. Gelöst über `scripts/db-apply.sh`, das die Verbindung selbst aus `.env.local` liest.
- [ ] **Auth-Einstellungen am Remote-Projekt setzen.** `supabase/config.toml` wirkt auf die lokale Instanz. Ob die neuere CLI sie per `supabase config push` auch remote anwendet, ist zu prüfen; andernfalls müssen Anmeldelink-Gültigkeit (60 Min), Sitzungsdauer (30 Tage gleitend), `enable_signup = false` und die Versandbremse im Supabase-Dashboard eingetragen werden.
- [ ] `npm run lint` reparieren (ESLint-9-Flat-Config) — vorhandener Mangel im Starter-Kit.

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
| Mandantentrennung über Zeilen-Zugriffsregeln der Datenbank, nicht über Filter in der Anwendung | Eine einzige vergessene Filterbedingung in einer von hunderten künftigen Abfragen wäre ein meldepflichtiger Vorfall über Kundengrenzen. Die Datenbank verzeiht Vergessen | 2026-11-25 |
| Automatisierter Test prüft jede Tabelle auf aktive Zugriffsregeln | Macht die Konvention überprüfbar statt nur vereinbart; eine neu angelegte Tabelle ohne Schutz fällt vor dem Deploy auf | 2026-11-25 |
| Berechtigung hängt an der Mitgliedschaft (Mensch + Betrieb), nicht am Nutzerkonto | Grundlage für Mitarbeiter in mehreren Betrieben und für je eigene Rollen darin | 2026-11-25 |
| `platform_admin` als Merkmal am Profil statt als vierte Rolle in der Mitgliedschaft | AWSMD steht über allen Betrieben; als Mitgliedschaft wäre bei jedem neuen Kunden ein Eintrag mitzupflegen | 2026-11-25 |
| Support-Einblick ist Teil derselben Zugriffsregel wie die Mitgliedschaft | Der Zugriff endet beim Ablauf von selbst; es gibt keinen Schalter, dessen Umlegen man vergessen könnte | 2026-11-25 |
| Zugriffsprotokoll ist nur anfügbar, Änderung und Löschung durch Regeln verboten | Ein Protokoll, das der Protokollierte löschen kann, ist kein Protokoll — und genau das muss gegenüber dem Kunden belastbar sein | 2026-11-25 |
| Aktiver Betrieb wird serverseitig aus dem Profil gelesen, nicht aus einem Browserwert | Ein Wert im Browser ließe sich auf eine fremde Betriebskennung ändern. Die Zugriffsregeln würden das abfangen, aber es käme zu halb geladenen fremden Ansichten | 2026-11-25 |
| Anmeldelink 60 Minuten gültig, aber nur einmal verwendbar, plus Versandbremse | Nutzerentscheidung gegen 15 Minuten. Die Einmalverwendung begrenzt das Risiko im geteilten Büropostfach, weil der Link beim Öffnen verbraucht ist | 2026-11-25 |
| Sitzung 30 Tage, gleitend verlängert | Das Postfach ist das tägliche Arbeitswerkzeug; häufige Neuanmeldung würde als Schikane empfunden. Unbenutzte Geräte verlieren den Zugang von selbst | 2026-11-25 |
| Unbekannte E-Mail erhält dieselbe Antwort wie eine bekannte | Sonst wäre die Anmeldeseite ein Werkzeug, um die Kundenliste von AWSMD abzufragen | 2026-11-25 |
| `@supabase/ssr` wird ergänzt | Ohne serverseitig gültige Anmeldung kennt der Server den Nutzer nicht — darauf beruht das gesamte Schutzkonzept | 2026-11-25 |
| Supabase CLI für versionierte Datenbankänderungen | Von Hand im Dashboard gepflegtes Schema ist nach wenigen Monaten nicht mehr rekonstruierbar | 2026-11-25 |
| Dienstschlüssel nur serverseitig, mit Testprüfung gegen Auslieferung an den Browser | Der Dienstschlüssel umgeht alle Zugriffsregeln; im Browser wäre er ein Generalschlüssel für alle Mandanten | 2026-11-25 |
| Minimale Admin-Seite zum Anlegen von Betrieb und erstem Admin | Ohne sie ließe sich die Mandantentrennung kaum praktisch testen; sie wächst in PROJ-3 zur vollen Kundenverwaltung | 2026-11-25 |

---
<!-- Sections below are added by subsequent skills -->

## Implementation Notes (Backend)

**Stand:** 2026-11-25 — Backend gebaut, Oberfläche steht noch aus (PROJ-2 / Login-Seiten).

### Was gebaut wurde

**Datenbank** (`supabase/migrations/`)
- `20261125120000_proj1_foundation.sql` — Tabellen `tenants`, `profiles`, `memberships`,
  `support_grants`, `access_log`; Aufzählungstypen; Trigger für `updated_at`; Trigger, der
  beim Entstehen eines `auth.users`-Eintrags automatisch ein Profil anlegt; Trigger
  `assert_tenant_keeps_admin`, der verhindert, dass der letzte Kunden-Admin eines Betriebs
  entfernt oder herabgestuft wird.
- `20261125120100_proj1_rls.sql` — Hilfsfunktionen und alle Zugriffsregeln. `anon` bekommt
  auf keiner Tabelle Rechte. `access_log` hat bewusst **keine** Regel für UPDATE und DELETE;
  ohne Regel ist die Operation verboten, auch für AWSMD. Das Freigabefenster wird per
  Trigger auf 24 Stunden festgenagelt, unabhängig davon, was die Anwendung mitschickt.
  `guard_profile_update` verhindert Selbstbeförderung zum Plattform-Admin und den Wechsel
  in einen Betrieb ohne Mitgliedschaft.
- `public.can_read_tenant_content(tenant_id)` ist die Konvention für **alle** künftigen
  Inhaltstabellen (PROJ-4 bis PROJ-12): `using (can_read_tenant_content(tenant_id))`.
- `public.tables_without_rls()` listet jede Tabelle in `public` ohne aktives RLS. Muss
  immer leer sein; wird im SQL-Test geprüft.

**Konfiguration** (`supabase/config.toml`)
- `enable_signup = false` — Zugänge entstehen nur durch Einladung
- `otp_expiry = 3600` (60 Minuten, Entscheidung vom 2026-11-25), `max_frequency = "60s"`,
  `email_sent = 3` als Versandbremse
- `[auth.sessions] inactivity_timeout = "720h"` — 30 Tage gleitend, kein `timebox`

**Anwendung**
- `src/lib/supabase/server.ts` — Client für Server-Komponenten und Route Handler,
  öffentlicher Schlüssel, läuft durch die Zugriffsregeln
- `src/lib/supabase/client.ts` — Browser-Client
- `src/lib/supabase/admin.ts` — Dienstschlüssel, bricht ab, wenn er im Browser landet
- `src/lib/auth/session.ts` — `getSessionContext()` liest den aktiven Betrieb aus dem
  Profil, nicht aus dem Browser; `requireTenantAdmin`, `requirePlatformAdmin`
- `src/lib/auth/audit.ts` — Protokolleintrag ohne Inhalte, Namen oder Telefonnummern
- `src/lib/validation/schemas.ts` — Zod-Prüfung aller Eingaben
- `src/lib/api/respond.ts` — einheitliche Fehlerbehandlung; Datenbankfehler werden nach
  außen nur allgemein gemeldet

**API-Routen**

| Route | Methode | Berechtigung |
|-------|---------|--------------|
| `/api/auth/magic-link` | POST | offen; antwortet für unbekannte und bekannte Adressen identisch |
| `/api/session` | GET | offen; liefert `authenticated: false` ohne Anmeldung |
| `/api/tenants/switch` | POST | Mitglied des Zielbetriebs oder Plattform-Admin |
| `/api/admin/tenants` | GET, POST | nur Plattform-Admin |
| `/api/support-grants` | POST, DELETE | nur Kunden-Admin des Betriebs |
| `/api/access-log` | GET | Mitglied des Betriebs oder Plattform-Admin |

### Tests

- **32 Vitest-Tests, alle grün** (`npm test`): je Route der glückliche Pfad, 400 bei
  ungültiger Eingabe, 401 ohne Anmeldung, 403 bei falscher Rolle oder fremdem Betrieb.
- **SQL-Tests** (`supabase/tests/proj1_rls.test.sql`): **28 pgTAP-Prüfungen, alle grün**,
  ausgeführt am 2026-11-26 gegen das echte Projekt in Frankfurt über den Session pooler.
  Abgedeckt: Mandantentrennung, Rechte der Rolle `anon`, Rollengrenzen, das anfügbare
  Protokoll, der letzte Kunden-Admin, Support-Freigabe samt Ablauf und Widerruf,
  gesperrte Betriebe und die Pflichtprüfung auf Tabellen ohne RLS.
  Ausführen mit `./scripts/db-apply.sh --with-tests`. Mit der Aktivierungsfunktion
  sind es inzwischen **30 Prüfungen**.
- `npm run build` läuft fehlerfrei, alle sechs Routen kompilieren.

### Abweichungen vom Tech Design

- Zusätzlich zum geplanten Umfang kam `guard_profile_update` dazu. Beim Bauen fiel auf:
  ohne diesen Trigger könnte ein Nutzer sein eigenes `is_platform_admin` auf `true`
  setzen, weil die Regel `profiles_update_self` das Schreiben auf die eigene Zeile erlaubt.
  Eine Zugriffsregel kann nicht zwischen Spalten unterscheiden, ein Trigger schon.
- Ebenfalls ergänzt: `pin_support_grant_window` und `guard_support_grant_update`. Sonst
  könnte die Anwendung ein beliebig langes Fenster mitschicken oder eine laufende Freigabe
  verlängern, statt sie nur zu widerrufen.
- Der Dienstschlüssel wird außer im Tech Design genannten Zweck auch zum Aufräumen genutzt:
  scheitert die Einladung beim Anlegen eines Betriebs, wird der Betrieb wieder entfernt,
  damit keine halb angelegten Kunden zurückbleiben.

### Nachträgliche Korrekturen vor dem ersten Anwenden (2026-11-25)

Beim erneuten Durchlesen der Migrationen vor dem Anwenden auf das echte Projekt fielen drei
Fehler auf. Alle drei hätten die SQL-Tests gefangen, die zu diesem Zeitpunkt noch nicht
laufen konnten — ein Beleg dafür, dass ungeprüfte Zugriffsregeln nicht als geprüfte gelten
dürfen. Die Migrationen waren noch nirgends angewendet, deshalb wurden sie direkt
korrigiert statt durch Folgemigrationen ergänzt.

1. **`assert_tenant_keeps_admin` wäre bei jedem Löschen abgebrochen.** Die Funktion las
   `new.tenant_id`; bei `DELETE` ist `NEW` in PL/pgSQL nicht belegt, der Zugriff bricht ab.
   Zusätzlich gab sie `new` zurück — ein BEFORE-DELETE-Trigger muss `old` zurückgeben,
   sonst wird das Löschen stillschweigend verworfen. Ergebnis wäre gewesen: **kein**
   Mitarbeiter hätte je aus einem Betrieb entfernt werden können.
2. **Eine abgelaufene Support-Freigabe hätte jede weitere blockiert.** Der Unique-Index
   greift auf „nicht widerrufen", und ein Index-Prädikat kann `now()` nicht auswerten.
   Nach der ersten abgelaufenen Freigabe hätte der Betrieb nie wieder eine erteilen können.
   Gelöst im Trigger `pin_support_grant_window`, der abgelaufene Freigaben schließt;
   noch laufende lösen weiterhin bewusst einen Konflikt aus (409).
3. **Die Erkennung serverseitiger Rollen war unzuverlässig.** Die WHEN-Bedingung des
   Triggers prüfte `current_setting('role')`, das nicht über alle Verbindungswege gesetzt
   ist. Jetzt prüft die Funktion `current_user` gegen `postgres`, `supabase_admin` und
   `service_role`.

Dazu zwei weitere SQL-Prüfungen (jetzt 26), die den Ablauf-Fall abdecken.

### Erster Lauf gegen die echte Datenbank (2026-11-26)

Migrationen angewendet über `./scripts/db-apply.sh`, Tests über `--with-tests`.
Der Lauf hat **drei Dinge aufgedeckt**, die statische Betrachtung nicht gefunden hatte:

**1. Sicherheitslücke: `guard_profile_update` war wirkungslos.**
Die Funktion war `security definer`. In einer SECURITY-DEFINER-Funktion liefert
`current_user` den **Eigentümer** der Funktion (`postgres`), nicht die aufrufende Rolle.
Die Abkürzung „serverseitige Rollen dürfen alles" traf damit **immer** zu. Folge: jeder
angemeldete Nutzer hätte sein eigenes `is_platform_admin` auf `true` setzen und sich zum
AWSMD-Admin befördern können — und `last_tenant_id` auf einen fremden Betrieb stellen.

Besonders unangenehm: diese Zeile war meine eigene „Korrektur" vom Vortag. Sie sollte die
Rollenerkennung robuster machen und hat die Sicherung dabei abgeschaltet. Behoben in
`20261126090000_proj1_fix_profile_guard.sql` durch `security invoker`; dort ist
`current_user` die aufrufende Rolle. Belegt durch die Prüfungen 14 und 15.

**2. Testfehler: die Rolle `anon` wird schon am Tabellenzugriff abgewiesen.**
Die Prüfungen erwarteten eine leere Ergebnismenge. Tatsächlich antwortet die Datenbank mit
`42501 permission denied`, weil der Rolle in der Migration alle Tabellenrechte entzogen
wurden — `anon` kommt gar nicht bis zu den Zeilen-Zugriffsregeln. Das ist die stärkere
Garantie; korrigiert wurden die Erwartungen, nicht das Schema.

**3. Falsche Planzahl.** `plan(26)` bei 28 tatsächlichen Prüfungen. pgTAP meldet das als
Abweichung; korrigiert auf 28.

**Lehre für die weiteren Features:** Die Zugriffsregeln für PROJ-4 bis PROJ-12 gelten erst
als fertig, wenn ihre SQL-Prüfungen gegen eine echte Datenbank gelaufen sind. Zwei der drei
Befunde — darunter eine Rechteausweitung — waren beim Lesen des Codes nicht zu sehen.

### Vorhandener Mangel im Starter-Kit (nicht von PROJ-1 verursacht)

`npm run lint` ist unbrauchbar: Next 16 hat `next lint` entfernt, und ESLint 9 verlangt eine
`eslint.config.js`, während das Projekt noch `.eslintrc.json` mitbringt. Die Prüfung aus der
Backend-Checkliste konnte deshalb nicht laufen. Build und Tests laufen davon unberührt.

### Umgebungsvariablen

Siehe `docs/environment.md`. Bei Vercel sind `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` und `SUPABASE_SERVICE_ROLE_KEY` über die
Supabase-Integration gesetzt — allerdings nur für *Production* und *Preview*, nicht für
*Development*. `NEXT_PUBLIC_SITE_URL` fehlt noch.

## Implementation Notes (Frontend)

**Stand:** 2026-11-26 — Oberfläche gebaut und im Browser geprüft.

Bewusst schlicht gehalten: Design-System, Sidebar, Topbar und Theme-Umschaltung sind
laut Out of Scope **PROJ-2**. Hier geht es nur darum, dass Anmeldung und Zugangskontrolle
tragen. Übernommen wurden aus `docs/design-system.md` nur die Dinge, die ohnehin feststehen
und später kein Umbauen erfordern: die Schrift Inter, `lang="de"`, 44-px-Klickflächen und
das violette Markenzeichen in der Kopfzeile.

### Seiten

| Pfad | Zweck |
|------|-------|
| `/anmelden` | E-Mail eintragen, Anmeldelink anfordern; zeigt die Hinweise der Rückkehrseite |
| `/auth/callback` | Rücklauf des Anmeldelinks; tauscht `code` bzw. `token_hash` gegen eine Sitzung, aktiviert Einladungen, leitet zum gemerkten Ziel |
| `/` | Startseite im geschützten Bereich |
| `/verwaltung/betriebe` | Betriebsübersicht und Anlegen (nur Plattform-Admin) |
| `/einstellungen/zugriff` | Support-Freigabe und Zugriffsprotokoll (nur Kunden-Admin) |
| `/kein-betrieb` | Hinweisseite ohne Mitgliedschaft |
| `/betrieb-gesperrt` | Hinweisseite für gesperrte Betriebe, mit Wechsler zu anderen Betrieben |

### Dreifache Zugangskontrolle

1. **Middleware** (`src/middleware.ts`) erneuert die Sitzung bei jeder Anfrage und schickt
   Nicht-Angemeldete zur Anmeldung, mit der Zielseite als `weiter`-Parameter.
2. **Layout des geschützten Bereichs** entscheidet über Mitgliedschaft und Zustand des
   Betriebs und leitet auf die passende Hinweisseite.
3. **Zugriffsregeln der Datenbank** sind die eigentliche Sicherung. Die beiden Schichten
   darüber sorgen für sinnvolle Seiten statt leerer Listen.

Die Sitzungsprüfung nutzt überall `getUser()`, nie `getSession()`: `getSession()` vertraut
dem Cookie, `getUser()` prüft das Token gegen Supabase.

### Beim Bauen ergänzt

- **`activate_my_memberships()`** (Migration `20261126091000`). Die Admin-Route legt
  Mitgliedschaften mit Status `invited` an, `is_member_of()` verlangt aber `active` — ein
  eingeladener Kunden-Admin wäre nach dem Klick auf seinen Anmeldelink in einer leeren
  Anwendung gelandet. Umgesetzt als `security definer`-Funktion, die ausschließlich auf
  `auth.uid()` wirkt, nicht über den Dienstschlüssel: der würde alle Regeln umgehen, und
  der Anmeldeweg ist der letzte Ort, an dem man das will. Zwei SQL-Prüfungen belegen, dass
  fremde Einladungen unberührt bleiben.
- **Schutz gegen offene Weiterleitung.** Das gemerkte Ziel (`weiter`) wird im Zod-Schema
  und zusätzlich in der Rückkehrseite geprüft: nur Pfade, die mit `/` beginnen und nicht
  mit `//`. Ohne das ließe sich mit einem Anmeldelink auf eine fremde Seite umleiten.
  Drei Tests decken das ab.
- **Abmelden als POST**, damit kein Vorschau-Abruf eines Links den Nutzer abmeldet.
- **Freigabe wird abgefragt, Widerruf nicht.** Die gefährliche Richtung bekommt einen
  Dialog, der sagt, was AWSMD dann sieht; die sichere Richtung braucht keine Hürde.

### Geprüft

- **35 Vitest-Tests grün** (`npm test`), darunter die drei neuen zur Weiterleitung
- **30 SQL-Prüfungen grün** gegen das echte Projekt in Frankfurt
- `npm run build` fehlerfrei, 15 Routen plus Middleware
- Im Browser durchgespielt: Anmeldeseite lädt; eine **unbekannte** Adresse erhält dieselbe
  Bestätigung wie eine bekannte (kein Rückschluss auf die Kundenliste möglich);
  `/verwaltung/betriebe` ohne Anmeldung leitet auf `/anmelden?weiter=%2Fverwaltung%2Fbetriebe`;
  keine Fehler in der Browser-Konsole

### Nicht geprüft

Der Anmeldelink selbst wurde **nicht** durchgeklickt — dafür braucht es ein echtes Postfach
und einen eingerichteten Zugang. Ungeprüft sind damit: Rücklauf mit gültigem Link,
Aktivierung der Einladung im Zusammenspiel, Mandantenwechsel in der Oberfläche,
Betriebsübersicht, Support-Freigabe und Protokollansicht. Das ist Sache von `/qa`, sobald
der erste Betrieb angelegt ist.

## Tech Design (Solution Architect)

**Erstellt:** 2026-11-25

### Worum es hier geht

PROJ-1 baut kein sichtbares Produkt, sondern die Zusage, auf der alles andere steht: Daten
eines Kunden sind für andere Kunden unerreichbar, und AWSMD kommt an Inhalte nur, wenn der
Kunde es erlaubt. Deshalb liegt der Schwerpunkt dieses Designs nicht auf der Oberfläche,
sondern darauf, **wo** die Trennung erzwungen wird.

### Grundentscheidung: Die Datenbank bewacht sich selbst

Es gibt zwei Orte, an denen man Mandanten trennen kann:

1. **In der Anwendung** — jede Abfrage filtert nach dem Betrieb des angemeldeten Nutzers.
   Billig zu bauen. Aber: *eine* vergessene Filterbedingung in *einer* Abfrage, irgendwann
   in den nächsten zwei Jahren, und ein Kunde sieht die Daten eines anderen. Das ist ein
   meldepflichtiger Datenschutzvorfall und das Ende der Verkaufsgeschichte.
2. **In der Datenbank** — die Datenbank kennt den angemeldeten Nutzer und gibt von sich aus
   nur Zeilen heraus, für die er eine Mitgliedschaft hat. Eine vergessene Filterbedingung
   ist dann harmlos, weil die Datenbank ohnehin nichts anderes herausgibt.

Wir nehmen Weg 2. Supabase bringt das mit (Zeilen-Zugriffsregeln, „Row Level Security").
Die Mehrarbeit fällt einmal an, der Schutz gilt für jede künftige Tabelle und jede künftige
Abfrage — auch für die, die noch niemand geschrieben hat.

**Begleitende Zusicherung:** Ein automatisierter Test geht alle Tabellen der Datenbank
durch und schlägt fehl, sobald eine davon keine aktiven Zugriffsregeln hat. Damit kann man
die Absicherung nicht versehentlich vergessen — man wird daran erinnert, bevor etwas live geht.

### Komponentenstruktur

```
Öffentlicher Bereich
+-- Anmeldeseite
|   +-- E-Mail-Feld + Senden
|   +-- Bestätigung „Link verschickt" (mit Hinweis auf den Spam-Ordner)
|   +-- Erneut-senden-Schalter (erst nach 60 Sekunden aktiv)
+-- Rückkehrseite (der Link aus der E-Mail landet hier)
    +-- Erfolg -> Weiterleitung in den Betrieb
    +-- Link abgelaufen -> Hinweis + neuen anfordern
    +-- Link schon benutzt -> Hinweis + neuen anfordern

Zugangskontrolle (liegt um den gesamten geschützten Bereich)
+-- Prüft: angemeldet? -> sonst Anmeldeseite, Zielseite wird gemerkt
+-- Prüft: Mitgliedschaft oder Plattform-Admin? -> sonst Hinweisseite
+-- Prüft: Betrieb aktiv? -> sonst Seite „Betrieb gesperrt"

Geschützter Bereich
+-- Kopfzeile
|   +-- Mandantenwechsler (erscheint nur bei mehr als einem Betrieb)
|   +-- Nutzermenü -> Abmelden
+-- Inhaltsfläche (bleibt in PROJ-1 fast leer; PROJ-2 gestaltet sie,
|                  PROJ-4 bis PROJ-9 füllen sie)
+-- Startseite mit Begrüßung und Name des aktiven Betriebs

Nur für Plattform-Admin (AWSMD)
+-- Betriebsübersicht
|   +-- Liste aller Betriebe mit Status
|   +-- „Neuen Betrieb anlegen" (Name + E-Mail des ersten Admins)
+-- Betrieb sperren / entsperren

Nur für Kunden-Admin
+-- Support-Einblick
|   +-- Aktueller Zustand (keiner / aktiv bis <Zeitpunkt>)
|   +-- „24 Stunden freigeben" / „Sofort widerrufen"
+-- Zugriffsprotokoll (nur lesbar, nicht löschbar)

Hinweisseiten
+-- „Du bist noch keinem Betrieb zugeordnet"
+-- „Dieser Betrieb ist derzeit gesperrt"
+-- Störungsseite (Datenbank nicht erreichbar)
```

Alle Bausteine entstehen aus bereits installierten shadcn/ui-Komponenten (Button, Input,
Card, Dialog, Table, Dropdown-Menu, Sonner für Hinweise, Form für die Eingabeprüfung).
Es wird keine eigene Variante einer vorhandenen Komponente gebaut.

### Datenmodell in Klartext

**Betrieb** — ein Kunde von AWSMD, zum Beispiel „Fahrschule Muster"
- eigene Kennung
- Name, Kurzname für das Kürzel in der Seitenleiste
- Zustand: aktiv oder gesperrt
- angelegt am

**Profil** — ein Mensch mit einem Zugang
- eigene Kennung, identisch mit der Kennung aus der Anmeldung
- E-Mail-Adresse, Name
- Merkmal „Plattform-Admin": ja oder nein
- zuletzt genutzter Betrieb

**Mitgliedschaft** — verbindet Profil und Betrieb, **die eigentliche Berechtigung**
- Profil, Betrieb
- Rolle in diesem Betrieb: Kunden-Admin oder Mitarbeiter
- eingeladen am, zum ersten Mal angemeldet am
- Zustand: eingeladen oder aktiv

Ein Mensch kann mehrere Mitgliedschaften haben, in jedem Betrieb mit eigener Rolle. Die
Rolle hängt also nicht am Menschen, sondern an der Kombination Mensch + Betrieb.

**Support-Freigabe** — die befristete Ausnahme
- Betrieb, wer freigegeben hat
- Beginn, Ende (Beginn plus 24 Stunden)
- widerrufen am (leer, solange nicht widerrufen)

**Zugriffsprotokoll** — was AWSMD getan hat
- Betrieb, handelndes Konto, Zeitpunkt
- betroffener Bereich und Art des Zugriffs
- **nur anfügbar**: niemand kann Einträge ändern oder löschen, auch AWSMD nicht.
  Technisch durch Zugriffsregeln erzwungen, nicht durch eine Absprache.

**Verbindliche Konvention für alle künftigen Tabellen:** Jede Tabelle, die Kundendaten
enthält, trägt die Kennung des Betriebs als Pflichtfeld und hat Zugriffsregeln, die auf
eine bestehende Mitgliedschaft prüfen. Das gilt für Wissensbasis (PROJ-4), Nachrichten
(PROJ-5), Gespräche (PROJ-7), Termine (PROJ-12) und alles danach.

**Gespeichert in:** Supabase PostgreSQL, Region Frankfurt. Kein Browserspeicher für
Kundendaten.

### Wie die drei Rollen technisch wirken

- **Mitarbeiter und Kunden-Admin** unterscheiden sich allein durch die Rolle in ihrer
  Mitgliedschaft. Die Zugriffsregeln der Datenbank lesen diese Rolle; die Oberfläche blendet
  zusätzlich aus, was ohnehin abgewiesen würde. Das Ausblenden ist Komfort, die Regel ist
  der Schutz.
- **Plattform-Admin** darf Betriebe und Kennzahlen sehen, aber Inhalte nur, solange eine
  Support-Freigabe läuft. Das steckt in derselben Zugriffsregel: Zugriff auf Inhalte
  erfordert entweder eine Mitgliedschaft **oder** eine gültige, nicht widerrufene Freigabe.
  Läuft die Freigabe ab, hört der Zugriff ohne weiteres Zutun auf — es gibt keinen Schalter,
  den man vergessen könnte umzulegen.

### Wie der Mandantenwechsel getragen wird

Der aktive Betrieb wird **serverseitig** aus dem Profil gelesen, nicht aus einem Wert im
Browser. Der Grund ist unangenehm einfach: läge er im Browser, könnte man ihn dort auf die
Kennung eines fremden Betriebs ändern. Beim Wechsel schreibt der Server „zuletzt genutzter
Betrieb" ins Profil — und nur, wenn für diesen Betrieb eine Mitgliedschaft besteht. Die
Zugriffsregeln würden einen manipulierten Wert ohnehin abfangen; dieser Aufbau sorgt dafür,
dass es gar nicht erst zu einer halb geladenen, fremden Ansicht kommt.

### Anmeldung: Ablauf in Worten

1. Nutzer trägt seine E-Mail ein. Die Seite antwortet immer gleich — ob die Adresse bekannt
   ist oder nicht. Sonst wäre die Anmeldeseite ein Werkzeug, um die Kundenliste von AWSMD
   herauszufinden.
2. Supabase Auth verschickt den Anmeldelink. Gültig **60 Minuten**, verwendbar **genau
   einmal**. Mehr als drei Anfragen pro Minute und Adresse werden abgewiesen.
3. Nutzer klickt, landet auf der Rückkehrseite, die Sitzung entsteht.
4. Der Server ermittelt die Mitgliedschaften und leitet weiter: ein Betrieb → direkt hinein;
   mehrere → in den zuletzt genutzten; keiner und kein Plattform-Admin → Hinweisseite.
5. Die Sitzung hält **30 Tage und verlängert sich bei jeder Nutzung**. Wer täglich im
   Postfach arbeitet, meldet sich praktisch nie neu an; ein 30 Tage unbenutztes Gerät
   verliert den Zugang von selbst.

### Dienste und Pakete

Bereits vorhanden und ausreichend:
- `@supabase/supabase-js` — liegt im Projekt, muss in `src/lib/supabase.ts` nur noch
  aktiviert werden
- shadcn/ui-Komponenten, `react-hook-form` und `zod` für die Eingabeprüfung,
  `sonner` für Hinweise, `next-themes` (erst für PROJ-2 relevant)

Neu hinzuzufügen:
- **`@supabase/ssr`** — nötig, damit die Anmeldung in Next.js auch serverseitig gilt.
  Ohne dieses Paket kennt der Server den angemeldeten Nutzer nicht, und genau darauf beruht
  das ganze Schutzkonzept.
- **Supabase CLI** (nur Entwicklungswerkzeug) — für nachvollziehbare, versionierte
  Datenbankänderungen. Ohne sie wird das Schema im Dashboard von Hand gepflegt und ist
  nach drei Monaten nicht mehr rekonstruierbar.

Ausdrücklich **nicht** nötig: eine zusätzliche Bibliothek für Berechtigungen, ein eigener
Anmeldedienst, eine Zustandsverwaltung wie Redux.

### Was von AWSMD gebraucht wird, bevor gebaut werden kann

- Supabase-Projekt in der Region Frankfurt (`eu-central-1`), angelegt von dir
- Projekt-URL und die beiden Schlüssel (öffentlicher Schlüssel, Dienstschlüssel) als
  Umgebungsvariablen. Der Dienstschlüssel wird ausschließlich serverseitig verwendet und
  nie an den Browser ausgeliefert.
- Eine E-Mail-Absenderadresse für die Anmeldelinks. Für den Pilot genügt der
  Supabase-Standardversand; für eigenen Absender und bessere Zustellraten kommt in PROJ-8
  ein EU-Versanddienst dazu.

### Risiken und wie wir damit umgehen

| Risiko | Umgang |
|--------|--------|
| 60 Minuten gültiger Link in einem geteilten Büropostfach | Link ist nur **einmal** verwendbar und wird beim Öffnen verbraucht; zusätzlich Versandbremse. Das war eine bewusste Abwägung gegen 15 Minuten — Bequemlichkeit hat hier gewonnen, das Risiko ist benannt |
| Entwickler legt später eine Tabelle ohne Zugriffsregeln an | Automatisierter Test prüft alle Tabellen und schlägt fehl |
| Dienstschlüssel gelangt versehentlich in den Browser | Schlüssel wird nur in serverseitigem Code gelesen; eine Prüfung im Test stellt sicher, dass er in keinem Browser-Bündel auftaucht |
| Zugriffsregeln machen Abfragen langsam | Die Prüfung läuft über die Betriebskennung, die auf jeder Tabelle liegt und indiziert wird. Bei den erwarteten Datenmengen (ein Betrieb: einige Tausend Nachrichten pro Monat) unkritisch |
| Supabase-Standardversand landet im Spam | Hinweis auf den Spam-Ordner direkt in der Bestätigung; eigener Absender folgt in PROJ-8 |

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
