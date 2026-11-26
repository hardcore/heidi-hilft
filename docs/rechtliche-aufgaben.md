# Rechtliche und organisatorische Aufgaben

> Offene Punkte, die **nicht** durch Code gelöst werden, aber den Start blockieren.
> Technische Aufgaben stehen in `features/INDEX.md`, diese hier gehören zu einer Kanzlei,
> einem Datenschutzbeauftragten oder ins Vertriebsgespräch.
>
> **Keine Rechtsberatung.** Die Punkte beschreiben, was zu klären ist, nicht wie es
> auszugehen hat.

**Stand:** 2026-11-26

## Ausgangslage

| | |
|---|---|
| Anbieter | AWSMD — Awesome Model Development, **Dubai (VAE)** |
| Rolle | Auftragsverarbeiter. Verantwortlicher ist der jeweilige Betrieb |
| Kunden | Betriebe in Deutschland |
| Datenhaltung | Supabase Frankfurt (`eu-central-1`), KI über Mistral (EU) |
| Angemessenheitsbeschluss für die VAE | **nein** |

Daraus folgt: Die DSGVO gilt (Art. 3 Abs. 2), und jeder Zugriff aus Dubai auf
Kundendaten ist eine Drittlandsübermittlung — unabhängig davon, dass die Daten in
Frankfurt gespeichert sind.

---

## Blockierend vor dem ersten Kundenvertrag

### 1. Vertreter in der Union benennen (Art. 27 DSGVO)

- [ ] Vertreter in einem EU-Mitgliedstaat schriftlich benennen, in dem Betroffene ansässig
      sind — bei deutschen Kunden also in Deutschland
- [ ] Name und Kontakt in der Datenschutzerklärung und im AVV nennen

**Warum nicht aufschiebbar:** Die Ausnahme in Art. 27 Abs. 2 gilt nur für gelegentliche
Verarbeitung ohne nennenswertes Risiko. Heidi verarbeitet laufend Gesprächsinhalte und
Telefonnummern von Endkunden — die Ausnahme dürfte nicht greifen.

### 2. Übermittlungsgrundlage für die VAE schaffen

- [ ] Standardvertragsklauseln in den AVV aufnehmen (Modul für Verantwortlicher →
      Auftragsverarbeiter), Zielland VAE
- [ ] Risikoabschätzung für das Zielland erstellen und dokumentieren
- [ ] Technische und organisatorische Maßnahmen beschreiben, die die Übermittlung begrenzen

**Was dabei hilft:** Die Architektur begrenzt die Übermittlung bereits erheblich und das
lässt sich belegen — AWSMD sieht standardmäßig **keine** Inhalte, Einblick nur nach
befristeter Freigabe des Kunden (24 Stunden), und jeder Zugriff liegt in einem Protokoll,
das niemand ändern oder löschen kann. Das ist genau die Art Nachweis, die bei einer
Drittlandsübermittlung verlangt wird. Siehe `docs/v0/NEUSTART-BRIEF.md`, Abschnitt 3.6
und 3.7.

### 3. AVV-Muster für Kunden erstellen

- [ ] Auftragsverarbeitungsvertrag, den jeder Betrieb unterzeichnet
- [ ] Unterauftragnehmerliste als Anlage, **mit Sitz je Dienstleister**
- [ ] Verfahren für die Zustimmung zu neuen Unterauftragnehmern festlegen

Aktuell bekannte Unterauftragnehmer:

| Dienstleister | Zweck | Sitz / Datenhaltung |
|---------------|-------|---------------------|
| Supabase | Datenbank, Auth, Storage | Projekt in Frankfurt; Unternehmen USA |
| Vercel | Hosting | USA. **Zusätzlich Vertragspartner für die Datenbank**, weil Supabase über den Vercel-Marketplace bezogen wurde — siehe Punkt 5 |
| Mistral | KI-Antworten | Frankreich (EU) |
| 360dialog | WhatsApp Cloud API | Deutschland; Meta als weiterer Verarbeiter |
| Meta | WhatsApp-Infrastruktur | USA/Irland |
| Resend | Versand von Anmelde- und Hinweis-E-Mails | USA. Versandregion Irland wählbar, Kontodaten und Logs laut Doku in den USA, Metadaten 30 Tage |
| Stripe | Abo-Abrechnung (ab P1) | USA/Irland |

### 4. Vertriebsfrage klären

- [ ] Vor dem Pilotgespräch klären, ob ein deutscher Betrieb bereit ist, einen AVV mit
      einem Unternehmen in den VAE zu schließen

Das ist keine Rechts-, sondern eine Akzeptanzfrage. Ein „nein" an dieser Stelle wäre
teurer als jedes technische Problem. Mögliche Antworten, falls es klemmt: eine
europäische Gesellschaft als Vertragspartner vorschalten, oder den Vertreter nach Art. 27
im Verkaufsgespräch von vornherein offensiv nennen.

---

## Vor dem Produktivbetrieb

### 5. AVV-Kette über Vercel bereinigen

- [ ] Prüfen, ob Supabase direkt bezogen werden soll statt über den Vercel-Marketplace

Derzeit steht Vercel als Vertragspartner für die **Datenbank** in der Kette, nicht nur
fürs Hosting. Eine eigene Supabase-Organisation mit direktem Vertrag verkürzt die Kette.
Technisch ist es dieselbe Datenbank und derselbe Code — nur die Vertragsbeziehung ändert
sich. Je früher, desto weniger Daten sind zu migrieren.

### 6. Löschkonzept festlegen

- [ ] Aufbewahrungsfristen je Datenart bestimmen (Gespräche, Kontakte, Protokolle,
      Wissensbasis)
- [ ] Eigene Frist für das Zugriffsprotokoll oder allgemeine Frist?
- [ ] Verfahren für Auskunft und Löschung pro Kontakt beschreiben

Gehört technisch zu PROJ-10, braucht aber vorher eine Entscheidung, welche Fristen gelten.

### 7. Pflichtangaben und Dokumente

- [ ] Impressum mit der Dubaier Gesellschaft und dem Vertreter nach Art. 27
- [ ] Datenschutzerklärung für heidi-hilft.de
- [ ] Verzeichnis von Verarbeitungstätigkeiten (Art. 30) als Auftragsverarbeiter
- [ ] Hinweis für Endkunden, dass sie mit einer KI schreiben (EU AI Act) — technisch in
      PROJ-6 gelöst, textlich abzustimmen
- [ ] Umsatzsteuerliche Behandlung der Rechnungen an deutsche Betriebe (gehört zum
      Steuerberater, nicht hierher)

---

## Erledigt

- [x] **Region der Datenbank** — Frankfurt (`eu-central-1`), bestätigt am 2026-11-25.
      Nachträglich nicht änderbar, deshalb vor dem ersten Datensatz geprüft
- [x] **Maildienst entschieden** — Resend, mit ausdrücklicher Dokumentation der
      Drittlandsübermittlung im PRD statt der pauschalen Behauptung „alles in der EU"
- [x] **Zugriffsprotokoll technisch unveränderlich** — keine Policy für UPDATE und DELETE,
      auch AWSMD kann nichts löschen
- [x] **Einblick von AWSMD standardmäßig ohne Inhalte** — Freigabe nur durch den Kunden,
      auf 24 Stunden begrenzt, in der Datenbank erzwungen

---

## Querverweise

| Thema | Wo |
|-------|-----|
| Datenschutz-Rahmen im Produktdokument | `docs/PRD.md`, Abschnitt Constraints |
| Sicherheitsmodell und Begründungen | `docs/v0/NEUSTART-BRIEF.md`, Abschnitt 3 |
| Technische DSGVO-Umsetzung | `features/INDEX.md`, PROJ-10 |
