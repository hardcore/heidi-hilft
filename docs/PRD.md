# Product Requirements Document — Heidi

> White-Label-KI-Assistent für WhatsApp · heidi-hilft.de · Anbieter: AWSMD (Deutschland)

## Vision

Heidi beantwortet für lokale Dienstleister rund um die Uhr Kundenanfragen auf WhatsApp — vor allem nach Feierabend, wenn das Büro zu ist und die Anfrage sonst beim Wettbewerber landet. Jeder Kunde bekommt seine eigene, gebrandete Heidi, die ausschließlich auf Basis seines eigenen Wissens antwortet und bei Unsicherheit ans Team übergibt, statt zu raten.

Erster Markt sind Fahrschulen, später Friseure, Physiotherapie-Praxen und Handwerksbetriebe. Verkauft wird als SaaS-Abo für 349 €/Monat pro Kunde bei Zielkosten unter 80 €/Monat pro Kunde.

## Target Users

| Rolle | Wer | Bedarf / Schmerzpunkt |
|-------|-----|------------------------|
| **Admin** (Plattform) | Sascha / Betreiber | Kunden anlegen und live schalten, Kosten und Marge pro Kunde sehen, Fehler und Nummern-Qualität im Blick behalten. Schmerz: ohne Kostenansicht pro Kunde ist die Marge blind. |
| **Kunden-Admin** | z. B. Büroleitung der Fahrschule | Wissen und FAQ pflegen, Öffnungszeiten und Links hinterlegen, Dashboard und Gespräche sehen. Schmerz: 50–100 WhatsApp-Nachrichten am Tag, die abends unbeantwortet liegen bleiben; immer die gleichen fünf Fragen. |
| **Kunden-Mitarbeiter** | Fahrlehrer, Büro | Chats übernehmen, die Heidi übergibt; sehen, was Heidi schon gesagt hat. Schmerz: Kontext fehlt, wenn ein Gespräch auf dem Privathandy weiterläuft. |
| **Endkunde** | z. B. Fahrschüler, 17–25 | Sofort eine Antwort auf WhatsApp bekommen, ohne anzurufen oder Formulare auszufüllen. Kein Login, kein Portal, keine App. Ansprache per Du. |

## Core Features (Roadmap)

| Priorität | Feature | Status |
|-----------|---------|--------|
| P0 (MVP) | Supabase-Infrastruktur & Mandantenfähigkeit | Architected |
| P0 (MVP) | Design-System & App-Shell (hell + dunkel) | Roadmap |
| P0 (MVP) | Kunden- & Nutzerverwaltung (Admin) | Roadmap |
| P0 (MVP) | Wissensbasis & FAQ-Pflege | Roadmap |
| P0 (MVP) | WhatsApp-Anbindung über 360dialog | Roadmap |
| P0 (MVP) | Nachrichten-Worker & Heidis Antwortlogik | Roadmap |
| P0 (MVP) | Gesprächs-Postfach mit Übergabe | Roadmap |
| P0 (MVP) | Übergabe-Benachrichtigung | Roadmap |
| P0 (MVP) | Dashboard Basis | Roadmap |
| P0 (MVP) | DSGVO-Grundlagen (AVV, Löschkonzept, Auskunft) | Roadmap |
| P1 | Self-Service-Onboarding mit Stripe-Abo | Roadmap |
| P1 | Terminbuchung im Chat | Roadmap |
| P1 | Links, Formulare & PDF-Versand | Roadmap |
| P1 | Kosten & Marge pro Kunde (Admin) | Roadmap |
| P1 | „Frag Heidi" — Auswertung & FAQ-Lücken | Roadmap |
| P1 | Vorlagen & Erinnerungen außerhalb des 24-h-Fensters | Roadmap |
| P1 | Nummern-Qualität & Fehler-Monitoring | Roadmap |
| P1 | Aufgaben pro Gespräch | Roadmap |
| P2 | Website-Chat als zweiter Kanal | Roadmap |
| P2 | Instagram-DM als Kanal | Roadmap |
| P2 | Online-Anmeldung & Vertrag mit E-Signatur | Roadmap |
| P2 | Branchen-Startpakete (Friseure, Physios, Handwerk) | Roadmap |

Details und Reihenfolge: `features/INDEX.md`

## Success Metrics

**MVP (Pilot-Fahrschule, erste 30 Tage live)**
- Pilot-Fahrschule nutzt Heidi auf ihrer echten WhatsApp-Nummer — binäres Ziel
- ≥ 80 % der eingehenden Nachrichten beantwortet Heidi ohne Übergabe
- 0 inhaltlich falsche Antworten (jede Unsicherheit endet in einer Übergabe, nicht in einer Erfindung)
- ≥ 40 % der Gespräche starten außerhalb der Öffnungszeiten — das ist das Verkaufsargument
- Mediane Antwortzeit < 30 Sekunden
- Technisch: 100 % der Webhooks mit 200 in < 2 s quittiert, keine doppelt verarbeitete Nachricht

**Geschäft (nach dem Pilot)**
- Kosten pro Kunde < 80 €/Monat (Meta-Gebühren + KI-Token + Infrastruktur)
- 10 zahlende Kunden
- Onboarding eines neuen Kunden in < 60 Minuten

## Constraints

**Zeit & Team**
- Pilotstart in 4–6 Wochen (Ziel: Anfang Januar 2026)
- Ein Entwickler (du) plus Claude Code

**Technik**
- Next.js 16 (App Router), TypeScript, Tailwind + shadcn/ui, Deployment auf Vercel
- **Backend: Supabase** — Postgres, Auth, Storage, pgvector; Region **Frankfurt (eu-central-1)**
- **KI: Mistral (EU)** mit RAG über pgvector. Kein allgemeiner Chatbot — Heidi antwortet nur aus dem Wissen des jeweiligen Kunden (Meta-Vorgabe für WhatsApp-Business-Lösungen)
- **Warteschlange:** Tabelle `message_queue` in Supabase + Edge-Function-Worker. Dedupe über die Meta-Message-ID als Unique Key. Kein zusätzlicher Dienstleister, keine weiteren AVV
- WhatsApp Cloud API über **360dialog** (Partner-Account vorhanden), Integrated Onboarding, Coexistence mit der WhatsApp Business App möglich
- 24-Stunden-Service-Fenster: außerhalb nur genehmigte Templates
- Design system: siehe `docs/design-system.md`
- UI auf Deutsch, Endkunden-Ansprache per Du

**Recht & Datenschutz**
- Vertragspartner gegenüber Kunden ist AWSMD, Deutschland
- Alle personenbezogenen Daten in der EU
- AVV mit jedem Kunden, öffentliche Liste aller Unterauftragnehmer
- Löschkonzept mit Aufbewahrungsfristen; Auskunft und Löschung pro Kontakt im Admin auslösbar
- Keine Nachrichteninhalte in Logs, keine Inhalte in Benachrichtigungs-E-Mails
- EU AI Act: Heidi gibt sich im ersten Kontakt als KI zu erkennen

**Zugänge — Stand heute**
- ✅ 360dialog-Partner-Account
- ✅ Meta Business Manager verifiziert
- ⬜ Supabase-Projekt (Frankfurt) — muss manuell angelegt werden, Keys danach in die Env
- ⬜ Vercel-Projekt — kann aus Claude Code heraus angelegt und deployt werden
- ⬜ Stripe — erst für P1 nötig
- ⬜ **Pilot-Fahrschule noch nicht zugesagt** — größtes Projektrisiko, muss parallel zur Entwicklung gewonnen werden

## Non-Goals

Explizit **nicht** in dieser Version:
- Kein allgemeiner Chatbot und kein Smalltalk — Heidi antwortet nur aus der Wissensbasis des Kunden
- Keine Endkunden-Logins, kein Kundenportal für Fahrschüler
- Keine eigene Fahrschul-Verwaltung (Schülerakten, Abrechnung, Prüfungsverwaltung) und keine Anbindung an bestehende Fahrschul-Software
- Keine Zahlungsabwicklung zwischen Fahrschule und Schüler
- Keine Sprachnachrichten-Transkription, keine Bilderkennung
- Keine mobile App — die Web-App ist responsiv, das reicht
- Keine weiteren Kanäle im MVP (Website-Chat und Instagram sind P2)
- Keine Mehrsprachigkeit der Oberfläche — nur Deutsch
- Keine automatisierte Vertragsunterschrift im MVP (E-Signatur ist P2)
