# Product Requirements Document — Heidi

> White-Label-KI-Assistent für WhatsApp · heidi-hilft.de · Anbieter: AWSMD (Deutschland)

## Vision

Heidi beantwortet für lokale Betriebe rund um die Uhr Kundenanfragen auf WhatsApp — vor
allem nach Feierabend, wenn niemand im Büro ist und die Anfrage sonst beim Wettbewerber
landet. Jeder Betrieb bekommt seine eigene, gebrandete Heidi, die ausschließlich auf Basis
seines eigenen Wissens antwortet und bei Unsicherheit ans Team übergibt, statt zu raten.

Das Produkt ist **branchenunabhängig** gebaut: Ein Betrieb ist ein Mandant mit eigener
Wissensbasis, eigener WhatsApp-Nummer und eigenem Team. Ob dahinter eine Fahrschule, ein
Friseursalon, eine Physiotherapie-Praxis, ein Handwerksbetrieb, eine Werkstatt oder eine
Tierarztpraxis steht, macht für die Plattform keinen Unterschied — es unterscheidet sich
nur, was in der Wissensbasis steht.

Verkauft wird als SaaS-Abo für 349 €/Monat pro Betrieb bei Zielkosten unter 80 €/Monat
pro Betrieb.

### Markteinstieg

Der erste Markt sind **Fahrschulen**, weil dort drei Dinge zusammenkommen: viele Anfragen
per WhatsApp, immer wieder dieselben fünf Fragen, und eine Zielgruppe zwischen 17 und 25,
die nicht anruft. Der erste Kunde ist ein **Pilotbetrieb aus dieser Branche**.

Die Branche ist der Einstieg, nicht die Grenze. Jede Entscheidung in diesem Dokument und in
den Feature-Specs ist so zu treffen, dass ein Friseursalon am nächsten Tag ohne
Codeänderung angelegt werden kann. Branchenwissen gehört in die Wissensbasis und in
Startpakete (PROJ-22), nicht in die Anwendung.

## Target Users

| Rolle | Wer | Bedarf / Schmerzpunkt |
|-------|-----|------------------------|
| **AWSMD-Admin** (Plattform) | Betreiber | Betriebe anlegen und live schalten, Kosten und Marge pro Betrieb sehen, Fehler und Nummern-Qualität im Blick behalten. Schmerz: ohne Kostenansicht pro Betrieb ist die Marge blind. |
| **Kunden-Admin** | Inhaberin, Büroleitung, Praxismanagerin | Wissen und FAQ pflegen, Öffnungszeiten und Links hinterlegen, Dashboard und Gespräche sehen. Schmerz: 50–100 WhatsApp-Nachrichten am Tag, die abends unbeantwortet liegen bleiben; immer die gleichen Fragen. |
| **Kunden-Mitarbeiter** | Angestellte mit Kundenkontakt | Chats übernehmen, die Heidi übergibt; sehen, was Heidi schon gesagt hat. Schmerz: Kontext fehlt, wenn ein Gespräch auf dem Privathandy weiterläuft. |
| **Endkunde** | Kundschaft des Betriebs | Sofort eine Antwort auf WhatsApp bekommen, ohne anzurufen oder Formulare auszufüllen. Kein Login, kein Portal, keine App. Ansprache per Du. |

Die Rollen heißen bewusst nicht nach einer Branche. In der Oberfläche steht „Betrieb", nicht
„Fahrschule"; was der Betrieb anbietet, steht in seiner Wissensbasis.

## Core Features (Roadmap)

| Priorität | Feature | Status |
|-----------|---------|--------|
| P0 (MVP) | Supabase-Infrastruktur & Mandantenfähigkeit | In Progress |
| P0 (MVP) | Design-System & App-Shell (hell + dunkel) | Roadmap |
| P0 (MVP) | Betriebs- & Nutzerverwaltung (Admin) | Roadmap |
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
| P1 | Kosten & Marge pro Betrieb (Admin) | Roadmap |
| P1 | „Frag Heidi" — Auswertung & FAQ-Lücken | Roadmap |
| P1 | Vorlagen & Erinnerungen außerhalb des 24-h-Fensters | Roadmap |
| P1 | Nummern-Qualität & Fehler-Monitoring | Roadmap |
| P1 | Aufgaben pro Gespräch | Roadmap |
| P2 | Website-Chat als zweiter Kanal | Roadmap |
| P2 | Instagram-DM als Kanal | Roadmap |
| P2 | Online-Anmeldung & Vertrag mit E-Signatur | Roadmap |
| P2 | Branchen-Startpakete | Roadmap |

Details und Reihenfolge: `features/INDEX.md`

## Success Metrics

**MVP (Pilotbetrieb, erste 30 Tage live)**
- Der Pilotbetrieb nutzt Heidi auf seiner echten WhatsApp-Nummer — binäres Ziel
- ≥ 80 % der eingehenden Nachrichten beantwortet Heidi ohne Übergabe
- 0 inhaltlich falsche Antworten (jede Unsicherheit endet in einer Übergabe, nicht in einer Erfindung)
- ≥ 40 % der Gespräche starten außerhalb der Öffnungszeiten — das ist das Verkaufsargument
- Mediane Antwortzeit < 30 Sekunden
- Technisch: 100 % der Webhooks mit 200 in < 2 s quittiert, keine doppelt verarbeitete Nachricht

**Geschäft (nach dem Pilot)**
- Kosten pro Betrieb < 80 €/Monat (Meta-Gebühren + KI-Token + Infrastruktur)
- 10 zahlende Betriebe
- Onboarding eines neuen Betriebs in < 60 Minuten
- **Mindestens ein Betrieb außerhalb der Einstiegsbranche** — der Beleg dafür, dass die
  Plattform wirklich branchenunabhängig ist und nicht nur so heißt

## Constraints

**Zeit & Team**
- Pilotstart in 4–6 Wochen (Ziel: Anfang Januar 2026)
- Ein Entwickler plus Claude Code

**Technik**
- Next.js 16 (App Router), TypeScript, Tailwind + shadcn/ui, Deployment auf Vercel
- **Backend: Supabase** — Postgres, Auth, Storage, pgvector; Region **Frankfurt (eu-central-1)**
- **KI: Mistral (EU)** mit RAG über pgvector. Kein allgemeiner Chatbot — Heidi antwortet nur
  aus dem Wissen des jeweiligen Betriebs (Meta-Vorgabe für WhatsApp-Business-Lösungen)
- **Warteschlange:** Tabelle `message_queue` in Supabase + Edge-Function-Worker. Dedupe über
  die Meta-Message-ID als Unique Key
- WhatsApp Cloud API über **360dialog**, Integrated Onboarding, Coexistence mit der
  WhatsApp Business App möglich
- 24-Stunden-Service-Fenster: außerhalb nur genehmigte Templates
- **Mailversand: Resend** (entschieden am 2026-11-26). Der eingebaute Versand von Supabase
  erlaubt nur 2 Mails pro Stunde für das gesamte Projekt und blockiert damit das Onboarding
- Design system: siehe `docs/design-system.md`
- Umgebungsvariablen: siehe `docs/environment.md`
- UI auf Deutsch, Endkunden-Ansprache per Du
- **Keine Branchenannahmen im Code.** Branchenspezifisches gehört in die Wissensbasis eines
  Betriebs oder in ein Startpaket, nie in Datenmodell, Oberfläche oder Antwortlogik

**Recht & Datenschutz**
- Vertragspartner gegenüber Kunden ist AWSMD, Deutschland
- **Alle Kunden- und Endkundendaten liegen in der EU** (Supabase Frankfurt, EU-KI).
  Nachrichteninhalte, Kontaktdaten der Endkunden und die Wissensbasis verlassen die EU nie.
- **Eine Ausnahme, bewusst in Kauf genommen:** Der Versand von Anmelde- und
  Hinweis-E-Mails läuft über Resend (USA) unter Standardvertragsklauseln und dem
  EU-US Data Privacy Framework. Betroffen sind ausschließlich die dienstlichen
  E-Mail-Adressen von Mitarbeitenden der Betriebe, nicht die Daten von Endkunden.
  Benachrichtigungen enthalten grundsätzlich **keine Nachrichteninhalte**, nur einen Link
  ins Postfach. Resend speichert Metadaten 30 Tage. Resend gehört damit in die
  Unterauftragnehmerliste und in den AVV.
- AVV mit jedem Betrieb, öffentliche Liste aller Unterauftragnehmer
- Löschkonzept mit Aufbewahrungsfristen; Auskunft und Löschung pro Kontakt im Admin auslösbar
- Keine Nachrichteninhalte in Logs
- EU AI Act: Heidi gibt sich im ersten Kontakt als KI zu erkennen

**Zugänge — Stand 2026-11-26**
- ✅ 360dialog-Partner-Account
- ✅ Meta Business Manager verifiziert
- ✅ Supabase-Projekt in Frankfurt, Schema und Zugriffsregeln angewendet
- ✅ Vercel-Projekt mit Supabase-Integration
- ✅ Resend (über Vercel angebunden; SMTP-Zugang für Supabase noch einzurichten)
- ⬜ Stripe — erst für P1 nötig
- ⬜ **Pilotbetrieb noch nicht zugesagt** — größtes Projektrisiko

**Bekannte Tarifgrenzen (Supabase Free)**
- Sitzungssteuerung (Ablauf nach Inaktivität) erst ab Pro. Sitzungen laufen derzeit nie ab
- Eingebauter Mailversand fest auf 2 Mails/Stunde — daher Resend

## Non-Goals

Explizit **nicht** in dieser Version:
- Kein allgemeiner Chatbot und kein Smalltalk — Heidi antwortet nur aus der Wissensbasis
- Keine Endkunden-Logins, kein Kundenportal
- **Keine Branchen-Fachsoftware** — weder Kundenakten noch Abrechnung, Warenwirtschaft oder
  die interne Terminverwaltung eines Betriebs. Heidi ist der Kanal nach außen, nicht das
  System dahinter, und bindet im MVP auch keine Fachsoftware an
- Keine Zahlungsabwicklung zwischen Betrieb und Endkunde
- Keine Sprachnachrichten-Transkription, keine Bilderkennung
- Keine mobile App — die Web-App ist responsiv, das reicht
- Keine weiteren Kanäle im MVP (Website-Chat und Instagram sind P2)
- Keine Mehrsprachigkeit der Oberfläche — nur Deutsch
- Keine automatisierte Vertragsunterschrift im MVP (E-Signatur ist P2)
