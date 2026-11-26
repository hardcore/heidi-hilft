# Heidi — Produkt und aktueller Stand

> Kurzfassung von `docs/PRD.md` plus der Stand vom 2026-11-26.
> Bei Widersprüchen gilt `docs/PRD.md`.

## Was Heidi ist

Eine KI-Assistentin, die für lokale Betriebe rund um die Uhr Kundenanfragen auf **WhatsApp**
beantwortet — vor allem nach Feierabend, wenn niemand im Büro ist und die Anfrage sonst beim
Wettbewerber landet.

Jeder Betrieb bekommt seine eigene, gebrandete Heidi, die **ausschließlich aus seinem
eigenen Wissen** antwortet und bei Unsicherheit ans Team übergibt, statt zu raten.

- **Preis:** 349 €/Monat pro Betrieb, Zielkosten unter 80 €/Monat
- **Vertragspartner:** AWSMD — Awesome Model Development, Dubai (VAE). **Kein EU-Sitz**, siehe Datenschutz-Rahmen
- **Markteinstieg:** Fahrschulen. Viele WhatsApp-Anfragen, immer dieselben Fragen, eine
  Zielgruppe zwischen 17 und 25, die nicht anruft
- **Nicht die Grenze:** Friseure, Physiotherapie, Handwerk, Werkstätten, Praxen. Die
  Plattform unterscheidet das nicht — nur die Wissensbasis unterscheidet sich

**MVP-Ziel:** ein Pilotbetrieb, der Heidi live auf seiner echten WhatsApp-Nummer nutzt —
mit Onboarding, KI-Antworten aus der eigenen Wissensbasis, Postfach mit Übergabe und einem
einfachen Dashboard.

## Die vier Rollen

| Rolle | Technisch | Darf |
|-------|-----------|------|
| **AWSMD-Admin** | `profiles.is_platform_admin = true` | Betriebe anlegen und sperren, Kennzahlen und technische Fehler aller Betriebe sehen, zwischen Betrieben wechseln. **Keine** Gesprächsinhalte, Kontaktnamen oder Telefonnummern |
| **Kunden-Admin** | Mitgliedschaft mit `role = 'tenant_admin'` | Alles im eigenen Betrieb: Wissen pflegen, Gespräche sehen, Team verwalten, Support-Einblick für AWSMD freigeben |
| **Kunden-Mitarbeiter** | Mitgliedschaft mit `role = 'tenant_member'` | Gespräche sehen und übernehmen. Keine Teamverwaltung |
| **Endkunde** | kein Zugang | Schreibt nur per WhatsApp. Kein Login, kein Portal, keine App. Wird geduzt |

Ein Nutzerkonto kann Mitgliedschaften in **mehreren** Betrieben haben, je mit eigener Rolle.
Filialen und Verbünde sind bei lokalen Betrieben verbreitet.

**Der Einblick von AWSMD ist bewusst eingeschränkt:** standardmäßig nur Kennzahlen. Für
einen Supportfall kann ein Kunden-Admin 24 Stunden freigeben. Jeder Zugriff wird in einem
Protokoll festgehalten, das niemand ändern oder löschen kann, auch AWSMD nicht. Das ist
kein Beiwerk, sondern das Verkaufsargument beim Datenschutz.

## Fahrplan

Status laut `features/INDEX.md` vom 2026-11-26.

### P0 — MVP

| ID | Feature | Status | Hängt ab von |
|----|---------|--------|--------------|
| PROJ-1 | Supabase-Infrastruktur & Mandantenfähigkeit | **In Progress** (im Wesentlichen fertig) | — |
| PROJ-2 | Design-System & App-Shell (hell + dunkel) | Roadmap | — |
| PROJ-3 | Betriebs- & Nutzerverwaltung | Roadmap | 1, 2 |
| PROJ-4 | Wissensbasis & FAQ-Pflege | Roadmap | 1, 2 |
| PROJ-5 | WhatsApp-Anbindung über 360dialog | Roadmap | 1 |
| PROJ-6 | Nachrichten-Worker & Heidis Antwortlogik | Roadmap | 4, 5 |
| PROJ-7 | Gesprächs-Postfach mit Übergabe | Roadmap | 2, 5, 6 |
| PROJ-8 | Übergabe-Benachrichtigung | Roadmap | 7 |
| PROJ-9 | Dashboard Basis | Roadmap | 2, 6 |
| PROJ-10 | DSGVO-Grundlagen | Roadmap | 1, 3 |

### P1 — danach

PROJ-11 Self-Service-Onboarding mit Stripe · PROJ-12 Terminbuchung im Chat ·
PROJ-13 Links, Formulare & PDF-Versand · PROJ-14 Kosten & Marge pro Betrieb ·
PROJ-15 „Frag Heidi" (Auswertung, FAQ-Lücken) · PROJ-16 Vorlagen & Erinnerungen ·
PROJ-17 Nummern-Qualität & Fehler-Monitoring · PROJ-18 Aufgaben pro Gespräch

### P2 — später

PROJ-19 Website-Chat · PROJ-20 Instagram-DM · PROJ-21 Online-Anmeldung mit E-Signatur ·
PROJ-22 Branchen-Startpakete

**Empfohlene Reihenfolge:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10, danach
11 → 14 → 12 → 13 → 17 → 15 → 16 → 18.

## Was heute läuft

**Fertig und gegen eine echte Datenbank geprüft (PROJ-1):**
- Datenbankschema mit Betrieben, Profilen, Mitgliedschaften, Support-Freigaben und
  Zugriffsprotokoll; Zugriffsregeln auf jeder Tabelle
- Anmeldung per Magic Link ohne Passwort, Abmelden, Mandantenwechsler
- Zugangskontrolle in drei Schichten
- Betriebsübersicht für AWSMD inklusive Anlegen und Einladen des ersten Kunden-Admins
- Support-Freigabe und Zugriffsprotokoll
- 35 Vitest-Tests und 30 SQL-Prüfungen, beide grün; Build fehlerfrei

**Live vorhanden:** Supabase-Projekt in Frankfurt mit angewendetem Schema, Vercel-Projekt,
ein Plattform-Admin, ein Testbetrieb („Fahrschule Siegel").

## Was offen ist

| Offen | Warum es zählt |
|-------|----------------|
| **Kein Pilotbetrieb zugesagt** | Größtes Projektrisiko. Die Software kann fertig sein und trotzdem nirgends laufen |
| **Eigener Mailversand** | Supabase erlaubt eingebaut nur 2 Mails pro Stunde fürs ganze Projekt. Zwei Einladungen blockieren das Onboarding. Entschieden: Resend, braucht eine verifizierte Domain |
| **E-Mail-Vorlagen auf `token_hash`** | Sonst scheitern Einladungen grundsätzlich, siehe Fallstricke in `02-TECHNIK.md`. Nur nach SMTP-Einrichtung editierbar |
| **Sitzungen laufen nie ab** | Ablauf nach Inaktivität gibt es erst im Supabase-Pro-Plan. Vor dem ersten zahlenden Kunden zu lösen, notfalls selbst in der Middleware |
| **AVV-Kette über Vercel** | Supabase wurde über den Vercel-Marketplace bezogen; damit steht Vercel als Vertragspartner für die Datenbank in der Kette. Ein direkter Supabase-Vertrag wäre sauberer |
| **`npm run lint` kaputt** | Next 16 hat `next lint` entfernt, ESLint 9 braucht eine Flat-Config. Altlast des Starter-Kits |

## Rahmenbedingungen, die jede Entscheidung binden

**Datenschutz**
- Alle Kunden- und Endkundendaten liegen in der EU: Supabase Frankfurt, EU-KI (Mistral).
  Nachrichteninhalte, Kontaktdaten und Wissensbasis verlassen die EU nie
- **AWSMD sitzt in Dubai (VAE), also außerhalb der EU.** Die DSGVO gilt trotzdem
  (Art. 3 Abs. 2). Zwei Folgen: ein Vertreter in der Union nach Art. 27 ist zu benennen,
  und jeder Zugriff aus Dubai ist eine Drittlandsübermittlung — auch bei Speicherung in
  Frankfurt. Deshalb ist der standardmäßig eingeschränkte Einblick von AWSMD nicht Komfort,
  sondern die zentrale technische Maßnahme: weniger Zugriff heißt weniger Übermittlung
- **Eine bewusste Ausnahme:** Anmelde- und Hinweis-E-Mails laufen über Resend (USA) unter
  Standardvertragsklauseln. Betroffen sind nur dienstliche Adressen von Mitarbeitenden,
  keine Endkundendaten, und Benachrichtigungen enthalten keine Nachrichteninhalte
- AVV mit jedem Betrieb, öffentliche Unterauftragnehmerliste, Löschkonzept mit Fristen,
  Auskunft und Löschung pro Kontakt im Admin

**WhatsApp (ab PROJ-5)**
- Cloud API über 360dialog, Integrated Onboarding, Coexistence mit der WhatsApp Business App
- Webhooks: Signatur prüfen, **sofort 200 zurückgeben**, Verarbeitung über eine
  Warteschlange, doppelte Nachrichten über die Meta-Message-ID erkennen
- 24-Stunden-Service-Fenster beachten: außerhalb nur genehmigte Vorlagen
- Meta-Gebühren pro Betrieb erfassen

**Nicht-Ziele**
Kein allgemeiner Chatbot. Keine Endkunden-Logins. Keine Branchen-Fachsoftware (keine
Kundenakten, keine Abrechnung, keine interne Terminverwaltung). Keine Zahlungsabwicklung
zwischen Betrieb und Endkunde. Keine Sprachnachrichten-Transkription. Keine mobile App.
Keine Mehrsprachigkeit der Oberfläche.
