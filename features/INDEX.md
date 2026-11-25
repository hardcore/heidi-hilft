# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Roadmap** - `/init` done, feature identified in feature map, no spec file yet
- **Planned** - `/write-spec` done, full spec written, architecture not yet designed
- **Architected** - `/architecture` done, tech design approved, ready to build
- **In Progress** - `/frontend` or `/backend` active or completed, not yet in QA
- **In Review** - `/qa` active, testing in progress
- **Approved** - `/qa` passed, no critical/high bugs, ready to deploy
- **Deployed** - `/deploy` done, live in production

## Features

| ID | Feature | Beschreibung | Prio | Abhängigkeiten | Status | Spec | Created |
|----|---------|--------------|------|----------------|--------|------|---------|
| PROJ-1 | Supabase-Infrastruktur & Mandantenfähigkeit | Supabase-Projekt Frankfurt, Datenbankschema mit `tenant_id` auf jedem Datensatz, RLS-Policies, Auth, Rollen (platform_admin / tenant_admin / tenant_member) | P0 | keine | In Progress | [Spec](PROJ-1-supabase-infrastruktur-mandantenfaehigkeit.md) | 2026-11-25 |
| PROJ-2 | Design-System & App-Shell | CSS-Variablen für hell und dunkel nach `prefers-color-scheme`, Theme-Umschalter, Inter + Geist Mono, Sidebar, Topbar, Panel-Layout gemäß `docs/design-system.md` | P0 | keine | Roadmap | – | 2026-11-25 |
| PROJ-3 | Kunden- & Nutzerverwaltung (Admin) | Plattform-Admin legt Kunden an, lädt Kunden-Admins und Mitarbeiter ein, verwaltet Rollen und Status; Kunden-Admin verwaltet sein Team | P0 | PROJ-1, PROJ-2 | Roadmap | – | 2026-11-25 |
| PROJ-4 | Wissensbasis & FAQ-Pflege | FAQ-Einträge und Textbausteine pflegen, Öffnungszeiten, Links und PDFs hinterlegen; Embeddings in pgvector, automatische Neuberechnung bei Änderung | P0 | PROJ-1, PROJ-2 | Roadmap | – | 2026-11-25 |
| PROJ-5 | WhatsApp-Anbindung über 360dialog | Nummer verbinden, Webhook-Endpunkt mit Signaturprüfung, sofortiges 200, Schreiben in `message_queue`, Dedupe über Meta-Message-ID, Ein-/Ausgang senden, Zustellstatus | P0 | PROJ-1 | Roadmap | – | 2026-11-25 |
| PROJ-6 | Nachrichten-Worker & Heidis Antwortlogik | Edge-Function-Worker arbeitet die Queue ab, RAG über pgvector, Antwort von Mistral (EU), KI-Kennzeichnung im ersten Kontakt, Unsicherheit → Übergabe statt Erfindung, 24-h-Fenster prüfen | P0 | PROJ-4, PROJ-5 | Roadmap | – | 2026-11-25 |
| PROJ-7 | Gesprächs-Postfach mit Übergabe | Chatliste mit Filtern, Verlauf im WhatsApp-Look, Chat übernehmen und zurückgeben, Heidis Antwortvorschlag freigeben oder ändern, Notizen am Kontakt | P0 | PROJ-2, PROJ-5, PROJ-6 | Roadmap | – | 2026-11-25 |
| PROJ-8 | Übergabe-Benachrichtigung | E-Mail an die Büro-Adresse bei neuer Übergabe — ohne Nachrichteninhalt, nur Link ins Postfach; Badge „Offene Übergaben" in Navigation und Dashboard | P0 | PROJ-7 | Roadmap | – | 2026-11-25 |
| PROJ-9 | Dashboard Basis | Gespräche, Anteil nach Feierabend, offene Übergaben, Heatmap „Wann schreiben Kunden?", Anliegen nach Thema — Punkt-Matrix-Diagramme aus dem Design-System | P0 | PROJ-2, PROJ-6 | Roadmap | – | 2026-11-25 |
| PROJ-10 | DSGVO-Grundlagen | AVV-Zustimmung mit Protokollierung, öffentliche Unterauftragnehmerliste, Aufbewahrungsfristen und automatische Löschung, Auskunft und Löschung pro Kontakt, Log-Hygiene (keine Inhalte) | P0 | PROJ-1, PROJ-3 | Roadmap | – | 2026-11-25 |
| PROJ-11 | Self-Service-Onboarding mit Stripe-Abo | Gebrandete Anmeldestrecke: Firmendaten, Abo über Stripe, AVV-Zustimmung, danach 360dialog Integrated Onboarding mit Coexistence | P1 | PROJ-3, PROJ-5, PROJ-10 | Roadmap | – | 2026-11-25 |
| PROJ-12 | Terminbuchung im Chat | Heidi schlägt freie Zeitfenster als Auswahlknöpfe vor, bucht verbindlich, zeigt Termine in der Oberfläche, sagt ab und verschiebt | P1 | PROJ-6, PROJ-7 | Roadmap | – | 2026-11-25 |
| PROJ-13 | Links, Formulare & PDF-Versand | Verwaltete Links und Dokumente (Online-Anmeldung, Preisliste als PDF), Versand im Chat, Klick- und Abrufzählung | P1 | PROJ-4, PROJ-6 | Roadmap | – | 2026-11-25 |
| PROJ-14 | Kosten & Marge pro Kunde (Admin) | Meta-Gebühren pro Gespräch, KI-Token-Kosten, Infrastrukturanteil, Stripe-Umsatz — Marge pro Kunde und Monat, Warnung bei Zielkosten über 80 € | P1 | PROJ-3, PROJ-6 | Roadmap | – | 2026-11-25 |
| PROJ-15 | „Frag Heidi" — Auswertung & FAQ-Lücken | Rechtes Rail: Fragen in natürlicher Sprache an die eigenen Gesprächsdaten, erkannte FAQ-Lücken, Wochenbericht, Vorschlagschips | P1 | PROJ-9 | Roadmap | – | 2026-11-25 |
| PROJ-16 | Vorlagen & Erinnerungen | Genehmigte Meta-Templates verwalten, Erinnerungen außerhalb des 24-h-Fensters planen und versenden, Einwilligung und Abmeldung | P1 | PROJ-6, PROJ-12 | Roadmap | – | 2026-11-25 |
| PROJ-17 | Nummern-Qualität & Fehler-Monitoring | Meta-Qualitätsstufe und Nachrichtenlimit pro Nummer, fehlgeschlagene Sendungen, Queue-Rückstau, Fehlerliste im Plattform-Admin | P1 | PROJ-5, PROJ-14 | Roadmap | – | 2026-11-25 |
| PROJ-18 | Aufgaben pro Gespräch | Aufgaben am Gespräch oder Kontakt anlegen, zuweisen, abhaken; offene Aufgaben im Dashboard | P1 | PROJ-7 | Roadmap | – | 2026-11-25 |
| PROJ-19 | Website-Chat als zweiter Kanal | Einbettbares Chat-Widget für die Kundenwebsite, gleiche Wissensbasis und dasselbe Postfach | P2 | PROJ-6, PROJ-7 | Roadmap | – | 2026-11-25 |
| PROJ-20 | Instagram-DM als Kanal | Instagram-Direktnachrichten über die Meta-API im selben Postfach | P2 | PROJ-19 | Roadmap | – | 2026-11-25 |
| PROJ-21 | Online-Anmeldung & Vertrag mit E-Signatur | Eigener Webservice für Fahrschulanmeldung und Ausbildungsvertrag inklusive elektronischer Signatur, aus dem Chat heraus gestartet | P2 | PROJ-13 | Roadmap | – | 2026-11-25 |
| PROJ-22 | Branchen-Startpakete | Vorbefüllte Wissensbasen und Themen für Friseure, Physiotherapie und Handwerk, damit das Onboarding neuer Branchen schnell geht | P2 | PROJ-4, PROJ-11 | Roadmap | – | 2026-11-25 |

## Empfohlene Baureihenfolge

**MVP (schlanker Pilot, Onboarding von Hand)**
1. PROJ-1 Supabase-Infrastruktur & Mandantenfähigkeit
2. PROJ-2 Design-System & App-Shell
3. PROJ-3 Kunden- & Nutzerverwaltung
4. PROJ-4 Wissensbasis & FAQ-Pflege
5. PROJ-5 WhatsApp-Anbindung über 360dialog
6. PROJ-6 Nachrichten-Worker & Heidis Antwortlogik
7. PROJ-7 Gesprächs-Postfach mit Übergabe
8. PROJ-8 Übergabe-Benachrichtigung
9. PROJ-9 Dashboard Basis
10. PROJ-10 DSGVO-Grundlagen

**Danach, in Richtung verkaufsfähig:** PROJ-11 → PROJ-14 → PROJ-12 → PROJ-13 → PROJ-17 → PROJ-15 → PROJ-16 → PROJ-18

**Später:** PROJ-19 → PROJ-20 → PROJ-21 → PROJ-22

## Next Available ID: PROJ-23
