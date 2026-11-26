# Heidi — Projektbrief

> Alles, was du wissen musst, um Heidi von Grund auf zu bauen. Eine Datei, keine
> Vorarbeit nötig. Plane selbst, was in welcher Reihenfolge zu tun ist — dieser Brief
> sagt dir, **was** entstehen soll, **unter welchen Bedingungen**, und **woran du
> erkennst, dass es richtig ist**.

---

# 1. Was Heidi ist

Eine KI-Assistentin, die für lokale Betriebe rund um die Uhr Kundenanfragen auf **WhatsApp**
beantwortet — vor allem nach Feierabend, wenn niemand im Büro ist und die Anfrage sonst
beim Wettbewerber landet.

Jeder Betrieb bekommt seine eigene, gebrandete Heidi. Sie antwortet **ausschließlich aus dem
Wissen dieses einen Betriebs** und übergibt bei Unsicherheit ans Team, statt zu raten.

- **Anbieter:** AWSMD, Deutschland. Domain: heidi-hilft.de
- **Preis:** 349 €/Monat pro Betrieb, Zielkosten unter 80 €/Monat
- **Oberfläche:** Deutsch. Endkunden werden geduzt
- **Erster Markt:** Fahrschulen — viele WhatsApp-Anfragen, immer dieselben Fragen, eine
  Zielgruppe zwischen 17 und 25, die nicht anruft

**Branchenunabhängig bauen.** Fahrschulen sind der Einstieg, nicht die Grenze. Danach
kommen Friseure, Physiotherapie, Handwerk, Werkstätten, Praxen. Die Plattform darf das
nicht unterscheiden — nur die Wissensbasis unterscheidet sich. In der Oberfläche heißt es
immer „Betrieb", nie „Fahrschule". Prüfe bei jedem Feld und jeder Aufzählung: **Gilt das
auch für einen Friseursalon?** Wenn nein, gehört es in die Wissensbasis, nicht ins Schema.

---

# 2. Wer das benutzt

| Rolle | Darf | Darf nicht |
|-------|------|------------|
| **Plattform-Admin** (AWSMD) | Betriebe anlegen und sperren, Kennzahlen, Kosten und technische Fehler aller Betriebe sehen, zwischen Betrieben wechseln | **Keine Gesprächsinhalte, keine Kontaktnamen, keine Telefonnummern** — außer bei befristeter Freigabe durch den Kunden |
| **Kunden-Admin** | Alles im eigenen Betrieb: Wissen pflegen, Gespräche lesen, Team verwalten, Support-Einblick freigeben | Nichts in fremden Betrieben |
| **Kunden-Mitarbeiter** | Gespräche im eigenen Betrieb lesen und übernehmen | Team verwalten, Support-Einblick freigeben |
| **Endkunde** | Per WhatsApp schreiben | Hat keinen Zugang, kein Konto, kein Portal |

Ein Nutzerkonto kann Mitgliedschaften in **mehreren** Betrieben haben, je mit eigener Rolle.
Filialen und Verbünde sind bei lokalen Betrieben verbreitet, und Mitarbeitende arbeiten oft
für mehrere. Die Rolle hängt deshalb nicht am Menschen, sondern an der Kombination
Mensch + Betrieb.

Der Plattform-Admin ist **keine Mitgliedschaft**, sondern eine Eigenschaft des Kontos — er
steht über allen Betrieben.

---

# 3. Das Sicherheitsmodell

**Das ist der wichtigste Abschnitt dieses Dokuments. Lies ihn zweimal.**

## 3.1 Was schiefgehen kann

Heidi ist mandantenfähige Software für kleine Betriebe. Der katastrophale Fehler ist nicht
ein Absturz — es ist, dass **Betrieb A die Daten von Betrieb B sieht**. Konkret: dass eine
Fahrschule die Telefonnummern und Gespräche einer anderen Fahrschule im selben Ort lesen
kann. Das ist ein meldepflichtiger Datenschutzvorfall, das Ende des Produkts und ein
Haftungsfall.

Der zweite katastrophale Fehler: ein Nutzer verschafft sich selbst Rechte, die er nicht
haben soll — etwa die Plattform-Rolle.

Der dritte: AWSMD liest Kundengespräche mit, obwohl zugesichert wurde, dass das nicht
geht.

Alles Weitere in diesem Abschnitt dient dazu, dass diese drei Dinge **technisch unmöglich**
sind und nicht nur „nicht vorgesehen".

## 3.2 Der Grundsatz: die Datenbank bewacht sich selbst

Es gibt zwei Orte, an denen man Mandanten trennen kann:

1. **In der Anwendung** — jede Abfrage filtert nach dem Betrieb des angemeldeten Nutzers.
   Billig zu bauen. Aber: *eine* vergessene Bedingung in *einer* von hunderten Abfragen,
   irgendwann in zwei Jahren, von irgendwem geschrieben — und die Daten fließen über
   Kundengrenzen.
2. **In der Datenbank** — die Datenbank kennt den angemeldeten Nutzer und gibt von sich aus
   nur Zeilen heraus, für die eine Mitgliedschaft besteht. Eine vergessene Filterbedingung
   ist dann folgenlos.

**Baue Weg 2.** Supabase bringt das mit (Row Level Security). Die Mehrarbeit fällt einmal
an, der Schutz gilt für jede künftige Tabelle und jede künftige Abfrage — auch für die, die
noch niemand geschrieben hat. Die Datenbank verzeiht Vergessen, die Anwendung nicht.

## 3.3 Regeln, die ausnahmslos gelten

1. **Jede Tabelle mit Kundendaten hat eine Spalte `tenant_id`**, `not null`, mit
   Fremdschlüssel auf `tenants(id)` und `on delete cascade`, und einen Index darauf.
2. **Auf jeder Tabelle in `public` ist RLS aktiv.** Ohne Ausnahme, auch bei
   Hilfstabellen.
3. **Die Rolle `anon` bekommt nirgends Rechte.** `revoke all on <tabelle> from anon;`
   Nicht angemeldet heißt: kommt nicht einmal bis zu den Zeilenregeln.
4. **Niemals eine `tenant_id` aus dem Browser übernehmen.** Der aktive Betrieb wird
   serverseitig aus dem Profil gelesen. Läge er im Browser, ließe er sich auf eine fremde
   Kennung ändern.
5. **Der Dienstschlüssel (`SUPABASE_SERVICE_ROLE_KEY`) bleibt auf dem Server.** Er umgeht
   alle Zugriffsregeln und ist ein Generalschlüssel für sämtliche Betriebe. Niemals mit
   `NEXT_PUBLIC_` präfixen, niemals in einer Client-Komponente importieren, niemals
   protokollieren. Er wird für genau zwei Dinge gebraucht: einen Betrieb anlegen und einen
   Nutzer einladen.
6. **Sitzung immer über `supabase.auth.getUser()` prüfen, nie über `getSession()`.**
   `getSession()` vertraut dem Cookie, `getUser()` prüft das Token gegen Supabase.
7. **Keine Nachrichteninhalte in Logs, Fehlermeldungen oder Benachrichtigungen.**
   Protokolliert werden Fehlercodes und Kennungen. Benachrichtigungs-E-Mails enthalten
   einen Link, nicht den Inhalt.
8. **Datenbankfehler gehen nicht nach außen.** Nach außen eine allgemeine Meldung, die
   Einzelheiten ins Serverprotokoll — Fehlermeldungen verraten sonst die Struktur.
9. **Auch Storage-Buckets brauchen Regeln.** Hochgeladene PDFs (Preislisten, Formulare)
   liegen pro Betrieb getrennt, mit Pfad-Präfix `<tenant_id>/…` und passenden Policies.
   Ein öffentlicher Bucket ist keine Option.
10. **Jede neue Tabelle bekommt eine Prüfung**, die die Trennung belegt. Siehe 3.8.

## 3.4 Hilfsfunktionen

Lege diese Funktionen einmal an. Sie sind `stable security definer` mit festem
`search_path` — das ist nötig, damit sie die Mitgliedschaftstabelle lesen können, ohne
selbst wieder durch RLS zu laufen. Ohne das entstünde eine Endlosschleife, sobald eine
Regel auf `memberships` prüft.

```sql
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer
set search_path = public, pg_temp as $$
  select coalesce((select p.is_platform_admin from public.profiles p
                    where p.id = auth.uid()), false);
$$;

-- Mitgliedschaft UND aktiver Betrieb. Das ist die Bedingung für Datenzugriff.
create or replace function public.is_member_of(target_tenant uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.memberships m
      join public.tenants t on t.id = m.tenant_id
     where m.tenant_id = target_tenant
       and m.profile_id = auth.uid()
       and m.status = 'active'
       and t.status = 'active');
$$;

-- Mitgliedschaft unabhängig vom Zustand des Betriebs.
-- Nötig, damit ein Mitglied die Hinweisseite "Betrieb gesperrt" sehen kann.
create or replace function public.is_member_of_any_status(target_tenant uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp as $$
  select exists (select 1 from public.memberships m
                  where m.tenant_id = target_tenant and m.profile_id = auth.uid());
$$;

create or replace function public.has_tenant_role(target_tenant uuid, needed membership_role)
returns boolean language sql stable security definer
set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.memberships m
      join public.tenants t on t.id = m.tenant_id
     where m.tenant_id = target_tenant
       and m.profile_id = auth.uid()
       and m.status = 'active'
       and m.role = needed
       and t.status = 'active');
$$;

-- Befristete Freigabe durch den Kunden. Gilt nur für Plattform-Admins.
create or replace function public.has_support_access(target_tenant uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp as $$
  select public.is_platform_admin() and exists (
    select 1 from public.support_grants g
     where g.tenant_id = target_tenant
       and g.revoked_at is null
       and g.expires_at > now());
$$;

-- DIE Funktion für alle Inhaltstabellen.
create or replace function public.can_read_tenant_content(target_tenant uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp as $$
  select public.is_member_of(target_tenant)
      or public.has_support_access(target_tenant);
$$;

-- Selbstprüfung: muss immer leer sein.
create or replace function public.tables_without_rls()
returns table (table_name text) language sql stable security definer
set search_path = public, pg_temp as $$
  select c.relname::text from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
   order by c.relname;
$$;
```

## 3.5 Das Muster für jede neue Tabelle

```sql
create table public.beispiel (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  -- fachliche Spalten
  created_at timestamptz not null default now()
);

create index beispiel_tenant_idx on public.beispiel (tenant_id);

revoke all on public.beispiel from anon;
grant select, insert, update, delete on public.beispiel to authenticated;

alter table public.beispiel enable row level security;

create policy beispiel_select on public.beispiel
  for select to authenticated
  using (public.can_read_tenant_content(tenant_id));

create policy beispiel_write on public.beispiel
  for all to authenticated
  using (public.is_member_of(tenant_id))
  with check (public.is_member_of(tenant_id));
```

**Lesen über `can_read_tenant_content()`, Schreiben über `is_member_of()`.** Der
Unterschied ist Absicht: Lesen erlaubt zusätzlich eine laufende Support-Freigabe, Schreiben
niemals. AWSMD darf im Supportfall mitlesen, aber nie etwas ändern.

## 3.6 AWSMD sieht standardmäßig keine Inhalte

AWSMD ist Auftragsverarbeiter, nicht Eigentümer der Daten. Technisch erzwungene
Zurückhaltung ist im AVV sauber und im Verkaufsgespräch ein Argument statt einer
Erklärungsnot.

- **Standard:** Der Plattform-Admin sieht Betriebe, Kennzahlen, Kosten und technische
  Fehler. Keine Nachrichtentexte, keine Kontaktnamen, keine Telefonnummern.
- **Ausnahme:** Ein Kunden-Admin kann **24 Stunden** freigeben. Das Fenster setzt ein
  Trigger in der Datenbank, nicht die Anwendung — sonst könnte ein Fehler im Code ein
  beliebig langes Fenster erzeugen.
- Die Freigabe **endet von selbst**. Es gibt keinen Schalter, dessen Umlegen man vergessen
  könnte: `has_support_access()` prüft `expires_at > now()` bei jedem Zugriff.
- Ein Kunden-Admin kann jederzeit **sofort widerrufen**.
- Ein Plattform-Admin kann sich die Freigabe **nicht selbst erteilen** — die
  Insert-Policy verlangt `has_tenant_role(tenant_id, 'tenant_admin')` **und**
  `granted_by = auth.uid()`.
- Höchstens eine offene Freigabe je Betrieb.

## 3.7 Das Zugriffsprotokoll ist nur anfügbar

Jeder Zugriff von AWSMD auf Kundendaten wird festgehalten: wer, wann, welcher Bereich,
welche Art. **Ohne Nachrichteninhalte.**

```sql
create policy access_log_select on public.access_log
  for select to authenticated
  using (public.is_member_of_any_status(tenant_id) or public.is_platform_admin());

create policy access_log_insert on public.access_log
  for insert to authenticated
  with check ((public.is_member_of_any_status(tenant_id) or public.is_platform_admin())
              and actor_id = auth.uid());

-- Bewusst KEINE Policy für UPDATE und DELETE.
-- Ohne Policy ist die Operation verboten - auch für AWSMD.
revoke update, delete on public.access_log from authenticated;
```

Ein Protokoll, das der Protokollierte löschen kann, ist kein Protokoll. Genau das muss
gegenüber dem Kunden belastbar sein. Halte zusätzlich die E-Mail-Adresse als Text fest,
damit der Eintrag auch nach Löschung eines Profils aussagekräftig bleibt.

## 3.8 Rechteausweitung verhindern

Die Policy „ein Nutzer darf seine eigene Profilzeile ändern" erlaubt **auch**, das Feld
`is_platform_admin` auf `true` zu setzen. Eine Zugriffsregel kann nicht zwischen Spalten
unterscheiden, ein Trigger schon:

```sql
create or replace function public.guard_profile_update()
returns trigger language plpgsql
security invoker                      -- NICHT definer, siehe unten
set search_path = public, pg_temp as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') then
    return new;
  end if;

  if new.is_platform_admin is distinct from old.is_platform_admin then
    raise exception 'is_platform_admin kann nicht über die Anwendung geändert werden'
      using errcode = 'insufficient_privilege';
  end if;

  if new.last_tenant_id is not null
     and new.last_tenant_id is distinct from old.last_tenant_id
     and not public.is_member_of_any_status(new.last_tenant_id)
     and not public.is_platform_admin() then
    raise exception 'Kein Zugriff auf diesen Betrieb'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end; $$;
```

**`security invoker` ist hier zwingend.** In einer SECURITY-DEFINER-Funktion liefert
`current_user` den *Eigentümer* der Funktion (`postgres`), nicht die aufrufende Rolle — die
Abkürzung oben träfe dann immer zu, und jeder Nutzer könnte sich selbst zum Plattform-Admin
machen. Dieser Fehler ist in der Vorgängerversion tatsächlich passiert und wurde nur von
einem Test gefunden.

Dieselbe Überlegung gilt überall, wo du Rechte an der eigenen Zeile vergibst: prüfe, welche
**Spalten** damit änderbar werden.

## 3.9 Weitere Angriffsflächen

**Kontoaufzählung.** Die Anmeldeseite antwortet für unbekannte und bekannte Adressen
**identisch**. Sonst wird sie zum Werkzeug, um die Kundenliste von AWSMD zu ermitteln.
Keine Meldung wie „Diese Adresse ist uns nicht bekannt".

**Offene Weiterleitung.** Wenn du nach der Anmeldung auf eine gemerkte Zielseite leitest,
lass nur Pfade zu, die mit `/` beginnen und **nicht** mit `//`. Die Basisadresse für
Rücklauf-Links kommt aus einer Umgebungsvariablen, nie aus dem `Host`-Header der Anfrage.
Sonst lässt sich ein echter Anmeldelink auf eine fremde Seite umbiegen — ein brauchbarer
Phishing-Baustein, weil die Mail legitim ist.

**Selbstregistrierung.** Abschalten. Zugänge entstehen nur durch Einladung.

**Entzogene Berechtigung mitten in der Sitzung.** Wird einem Nutzer die Mitgliedschaft
entzogen, endet der Zugriff beim nächsten Datenzugriff, nicht erst beim nächsten Login.
Das ergibt sich von selbst, wenn die Regeln in der Datenbank liegen — ein weiterer Grund
für Weg 2.

**Webhooks (sobald WhatsApp angebunden ist).** Signatur prüfen, bevor irgendetwas
verarbeitet wird. Sofort `200` zurückgeben, dann asynchron arbeiten. Doppelte Nachrichten
über die Meta-Message-ID als Unique Key erkennen — Meta liefert bei Unsicherheit erneut.

## 3.10 Diese Tests müssen existieren und grün sein

Schreibe sie als SQL-Tests (pgTAP) und führe sie **gegen eine echte Datenbank** aus.
Zugriffsregeln gelten erst als fertig, wenn ihre Prüfungen gelaufen sind — nicht, wenn sie
geschrieben sind.

- [ ] `tables_without_rls()` liefert kein Ergebnis
- [ ] Ein Mitglied von Betrieb A, das die Kennung eines Datensatzes aus B kennt, erhält
      beim direkten Abruf **kein Ergebnis** (nicht etwa eine Fehlermeldung mit Inhalt)
- [ ] Ein Mitglied von A kann in B **nichts anlegen** (Fehler `42501`)
- [ ] Ein Mitglied von A sieht keine Profile, Mitgliedschaften oder Protokolleinträge von B
- [ ] Die Rolle `anon` erhält auf jeder Tabelle `42501` — **nicht** eine leere Liste
- [ ] Ein Mitarbeiter kann niemanden einladen und keinen Support-Einblick freigeben
- [ ] Ein Nutzer kann sein eigenes `is_platform_admin` nicht auf `true` setzen
- [ ] Ein Nutzer kann `last_tenant_id` nicht auf einen Betrieb ohne Mitgliedschaft setzen
- [ ] Niemand kann Protokolleinträge ändern oder löschen, auch kein Kunden-Admin
- [ ] Der letzte Kunden-Admin eines Betriebs kann nicht entfernt oder herabgestuft werden
- [ ] Ohne Freigabe hat ein Plattform-Admin keinen Inhaltszugriff
- [ ] Ein Plattform-Admin kann sich eine Freigabe nicht selbst erteilen
- [ ] Mit laufender Freigabe hat er Zugriff; nach Widerruf und nach Ablauf nicht mehr
- [ ] Das Freigabefenster beträgt serverseitig 24 Stunden, unabhängig von der Eingabe
- [ ] Eine abgelaufene Freigabe blockiert keine neue
- [ ] In einem gesperrten Betrieb gibt es keinen Inhaltszugriff, der Betrieb bleibt aber
      sichtbar, damit die Hinweisseite erscheinen kann

Dazu Tests der API-Routen: je Route der glückliche Pfad, 400 bei ungültiger Eingabe,
401 ohne Anmeldung, 403 bei falscher Rolle oder fremdem Betrieb.

---

# 4. Datenmodell (Fundament)

Alles in `public`, alles mit RLS.

**`tenants`** — ein Betrieb
`id`, `name`, `short_name` (1–4 Zeichen, Kürzel für die Seitenleiste),
`status` (`active` | `suspended`), `created_at`, `updated_at`

**`profiles`** — ein Mensch mit Zugang, `id` identisch mit `auth.users.id`
`email` (eindeutig, Vergleich in Kleinschreibung), `full_name`, `is_platform_admin`,
`last_tenant_id`, Zeitstempel
Entsteht per Trigger auf `auth.users`.

**`memberships`** — die eigentliche Berechtigung
`tenant_id`, `profile_id`, `role` (`tenant_admin` | `tenant_member`),
`status` (`invited` | `active`), `invited_at`, `first_login_at`
Eindeutig je `(tenant_id, profile_id)`.
Ein Trigger verhindert, dass der **letzte** `tenant_admin` eines Betriebs entfernt oder
herabgestuft wird — sonst sperrt sich ein Betrieb aus und jemand muss von Hand in die
Datenbank.

**`support_grants`** — die befristete Ausnahme
`tenant_id`, `granted_by`, `granted_at`, `expires_at`, `revoked_at`

**`access_log`** — nur anfügbar
`tenant_id`, `actor_id`, `actor_email`, `as_platform_admin`, `area`, `action`, `occurred_at`

Fachtabellen (Wissensbasis, Nachrichten, Gespräche, Termine) entstehen mit ihrem Feature,
immer nach dem Muster aus 3.5.

---

# 5. Was gebaut werden soll

## 5.1 MVP — ein Pilotbetrieb nutzt Heidi live

1. **Fundament und Anmeldung.** Schema und Zugriffsregeln wie oben. Anmeldung per Magic
   Link ohne Passwort, Abmelden, Mandantenwechsler, Hinweisseiten („noch keinem Betrieb
   zugeordnet", „Betrieb gesperrt"). Eine schlichte Admin-Seite, um einen Betrieb anzulegen
   und den ersten Kunden-Admin einzuladen.
2. **Design-System und Grundgerüst.** Farben hell und dunkel, Seitenleiste, Kopfzeile
   (Abschnitt 7).
3. **Wissensbasis und FAQ.** Einträge und Textbausteine pflegen, Öffnungszeiten, Links,
   PDFs. Embeddings in pgvector, Neuberechnung bei Änderung.
4. **WhatsApp anbinden.** Über **360dialog** (Cloud API, Integrated Onboarding, Coexistence
   mit der WhatsApp Business App). Webhook mit Signaturprüfung, sofort `200`, Ablage in
   einer Warteschlangentabelle, Dedupe über die Meta-Message-ID.
5. **Antwortlogik.** Ein Worker arbeitet die Warteschlange ab: passende Wissensbausteine
   über pgvector suchen, Antwort von **Mistral (EU)** erzeugen. Heidi gibt sich im ersten
   Kontakt als KI zu erkennen (EU AI Act). Bei Unsicherheit **keine Antwort erfinden**,
   sondern ans Team übergeben. 24-Stunden-Fenster beachten.
6. **Gesprächs-Postfach.** Chatliste mit Filtern, Verlauf im WhatsApp-Look, Chat übernehmen
   und zurückgeben, Heidis Antwortvorschlag freigeben oder ändern, Notizen am Kontakt.
7. **Übergabe-Benachrichtigung.** E-Mail an die Büro-Adresse — **ohne Nachrichteninhalt**,
   nur ein Link ins Postfach. Dazu ein Zähler „offene Übergaben" in der Navigation.
8. **Dashboard.** Gespräche, Anteil nach Feierabend, gebuchte Termine, offene Übergaben,
   Heatmap „Wann schreiben Kunden?" (7 Wochentage × 24 Stunden), Anliegen nach Thema.
9. **DSGVO-Grundlagen.** AVV-Zustimmung mit Protokoll, öffentliche
   Unterauftragnehmerliste, Aufbewahrungsfristen mit automatischer Löschung, Auskunft und
   Löschung **pro Kontakt** im Admin, Log-Hygiene.

## 5.2 Danach

Self-Service-Onboarding mit Stripe-Abo · Terminbuchung im Chat mit Auswahlknöpfen ·
Links, Formulare und PDF-Versand · Kosten und Marge pro Betrieb (Meta-Gebühren,
KI-Token, Stripe-Umsatz) · „Frag Heidi": Auswertung und FAQ-Lücken in natürlicher Sprache ·
Vorlagen und Erinnerungen außerhalb des 24-Stunden-Fensters · Nummern-Qualität und
Fehler-Monitoring · Aufgaben pro Gespräch

**Später:** Website-Chat als zweiter Kanal · Instagram-DM · Online-Anmeldung und Vertrag
mit E-Signatur · Branchen-Startpakete mit vorbefüllten Wissensbasen

## 5.3 Ausdrücklich nicht

Kein allgemeiner Chatbot, kein Smalltalk — Heidi antwortet nur aus der Wissensbasis (das
ist eine **Meta-Vorgabe** für WhatsApp-Business-Lösungen, kein Geschmacksurteil). Keine
Endkunden-Logins. Keine Branchen-Fachsoftware: keine Kundenakten, keine Abrechnung, keine
interne Terminverwaltung des Betriebs, keine Anbindung an bestehende Fachsoftware. Keine
Zahlungsabwicklung zwischen Betrieb und Endkunde. Keine Sprachnachrichten-Transkription,
keine Bilderkennung. Keine mobile App — responsiv genügt. Keine Mehrsprachigkeit der
Oberfläche.

---

# 6. Technik

| Baustein | Wahl | Begründung |
|----------|------|------------|
| Framework | Next.js (App Router), TypeScript | |
| Oberfläche | Tailwind + shadcn/ui | installierte Komponenten werden **nie** nachgebaut |
| Formulare | react-hook-form + Zod | Prüfung serverseitig **und** im Browser; serverseitig ist die, die zählt |
| Datenbank | Supabase PostgreSQL, Region **Frankfurt (eu-central-1)** | DSGVO. Die Region lässt sich nachträglich nicht ändern |
| Anmeldung | Supabase Auth, **Magic Link ohne Passwort** | kein Zurücksetzen, keine schwachen Passwörter, Einladung ist derselbe Mechanismus |
| Wissenssuche | pgvector | |
| KI | **Mistral (EU)** mit RAG | EU-Vertrag, günstig genug für Zielkosten unter 80 € |
| WhatsApp | Cloud API über **360dialog** | |
| Warteschlange | Tabelle + Supabase Edge Function | kein weiterer Dienstleister, kein weiterer AVV |
| Mailversand | **Resend** als Custom SMTP in Supabase | der eingebaute Versand erlaubt nur 2 Mails pro Stunde fürs ganze Projekt |
| Hosting | Vercel | |
| Tests | Vitest, pgTAP, Playwright | |

**Umgebungsvariablen:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (nur Server), `NEXT_PUBLIC_SITE_URL`. Später
`D360_API_KEY`, `D360_WEBHOOK_SECRET`, `MISTRAL_API_KEY`, `RESEND_API_KEY`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Dokumentiere jede neue Variable mit Zweck,
**nie mit Wert**.

**Datenschutz-Rahmen**
- Alle Kunden- und Endkundendaten liegen in der EU. Nachrichteninhalte, Kontaktdaten und
  Wissensbasis verlassen die EU nie
- **Eine bewusste Ausnahme:** Anmelde- und Hinweis-E-Mails laufen über Resend (USA) unter
  Standardvertragsklauseln. Betroffen sind nur dienstliche Adressen von Mitarbeitenden,
  keine Endkundendaten, und Benachrichtigungen enthalten keine Nachrichteninhalte. Resend
  gehört in die Unterauftragnehmerliste und in den AVV
- Vertragspartner gegenüber Kunden ist AWSMD, Deutschland

---

# 7. Design

Hell und dunkel, Voreinstellung folgt `prefers-color-scheme`, Übersteuerung in den
Einstellungen. Speicherung **gerätelokal** über `next-themes` — eine Kontospalte könnte die
Anmeldeseite nicht einfärben, weil es dort noch keine Sitzung gibt.

**Schrift:** Inter (400, 500, 600). Geist Mono (400, 500) für Spalten- und
Gruppenbeschriftungen, Achsen und Tastaturkürzel.

**Klickflächen:** mindestens 44 px hoch, primäre Aktionen 46 px.

## Farben

| Token | Dunkel | Hell | Verwendung |
|-------|--------|------|------------|
| canvas | `#3D3D3F` | `#E6E6EA` | Fläche hinter der App-Hülle |
| shell | `#0B0B0D` | `#FFFFFF` | App-Hülle |
| surface | `#141416` | `#FFFFFF` | Panels |
| surface-2 | `#17171A` | `#FAFAFB` | Karten im Panel |
| surface-3 | `#202025` | `#F1F1F4` | Tabellenkopf, eingehende Chat-Bubble |
| surface-active | `#1E1E23` | `#F0ECFE` | aktiver Navigationseintrag |
| surface-hover | `#1C1C20` | `#F4F4F6` | Hover |
| input | `#0F0F11` | `#FFFFFF` | Suchfeld |
| control | `#111113` | `#FFFFFF` | Buttons, Chips |
| border | `#222227` | `#E6E6EA` | Panel-Rahmen |
| border-muted | `#26262B` | `#ECECEF` | Kartenrahmen, Tabellenzeilen |
| border-strong | `#2A2A30` | `#D6D6DC` | Button- und Input-Rahmen |
| text | `#EDEDEF` | `#17171A` | Standardtext |
| text-strong | `#FFFFFF` | `#0B0B0D` | aktiver Eintrag |
| text-soft | `#C9C9D0` | `#44444C` | sekundärer Text |
| text-muted | `#9A9AA3` | `#6E6E78` | Beschriftungen, Achsen, Platzhalter |
| **accent** | `#7356F1` | `#7356F1` | Violett: Marke, Flächen, Balken, Badges |
| accent-text | `#B9A8F8` | `#5F43DD` | violetter **Text** |
| accent-off | `#1F1F24` | `#EAEAEE` | unbelegte Punkte im Diagramm |
| success | `#22C55E` | `#16A34A` | Statuspunkt |
| success-text | `#4ADE80` | `#15803D` | Statustext |
| warning | `#F5B83D` | `#B45309` (Text) | Hinweis |
| danger | `#F04438` | `#D92D20` | Fehler |

**Wichtig:** `#7356F1` hat auf weißem Grund nur 4,6:1 Kontrast. Es ist die **Flächenfarbe**.
Für violetten Text auf Hell `#5F43DD` nehmen (6,1:1). Weiß auf `#7356F1` ergibt 4,9:1 und
ist für Buttontext ab 16 px in Ordnung.

**Zwei Fallen bei shadcn:**
1. **Namenskonflikt.** `--accent` heißt bei shadcn „dezente Hover-Fläche", hier „Violett".
   Übernimmt man die Werte direkt, wird jeder Hover violett. Lege eigene Token mit Präfix
   an (`--h-accent` …) und leite die shadcn-Variablen daraus ab.
2. **Format.** shadcn-Variablen enthalten blanke HSL-Werte, weil Tailwind sie als
   `hsl(var(--x))` einsetzt. Ein Hex-Wert darin ergibt ungültiges CSS und die Farbe fällt
   **still** aus. `#7356F1` → `251 85% 64%`, `#5F43DD` → `251 69% 56%`.

## Typografie

Seitentitel 32/500 (`-0.02em`) · Panel-Titel 28/500 · **Kennzahl 58/600** (`-0.04em`,
`line-height: 1`) · Kartentitel 22/500 · Abschnitt 20/500 · Beschreibung 18/400 ·
Fließtext 16–17/400 · Chips und Tabelle 15–16/400 · Badges 14/400 ·
Mono-Beschriftung 13/400 GROSSBUCHSTABEN mit `letter-spacing: 0.14em`

## Maße

**Radien:** Hülle 34 · Panel 22 · Karte 18 · Eingabekarte 16 · Avatar 14 ·
Button/Chip/Input 10 · Icon 8–9 · Badge 7 · Diagrammpunkt 2

**Abstände:** Panel innen 24 · zwischen Panels 14 · zwischen Abschnitten 22 · Grid 20 ·
Chips 10

**Layout:** Seitenleiste 220–280 px · Hauptbereich ab 620 px · rechtes Rail 320–400 px ·
maximale Breite 1420 px

## Chat im WhatsApp-Stil

Aufbau und Rhythmus wie WhatsApp, Farben bleiben Heidi.

| Element | Dunkel | Hell |
|---------|--------|------|
| Hintergrund | `#0F0F11` | `#F4F4F6` |
| eingehend (Endkunde) | `#202025` | `#FFFFFF` mit Rahmen |
| ausgehend (Heidi/Team) | `#2A2250` | `#EEE9FE` |
| Zeitstempel | `text-muted`, 13 px Mono | ebenso |

Bubble-Radius 14, auf der Sprecherseite 4. Heidis Nachrichten tragen ein Funkeln-Icon in
Violett und das Badge **„KI"**. Nachrichten vom Team zeigen die Initialen des Mitarbeiters.
Auswahlknöpfe erscheinen als vollbreite Buttons unter der Bubble.

## Diagramme

**Punkt-Matrix** statt Balken: Spalten über die Zeit, je Spalte bis zu 14 Punkte à 15 px
Höhe, Radius 2, Lücke 3 px, Gesamthöhe 252 px. Belegte Punkte in Violett, unbelegte in
`accent-off`. Achsenbeschriftungen in Geist Mono 13 px.

Die Heatmap „Wann schreiben Kunden?" nutzt dieselbe Logik: 7 Zeilen (Wochentage) × 24
Spalten (Stunden), Intensität über die Deckkraft des Violetts.

Jedes Diagramm bekommt `role="img"` und ein `aria-label`, das den Verlauf in Worten
beschreibt.

## Barrierefreiheit

Fokusring 2 px Violett mit 2 px Abstand — nie entfernen. Dekorative SVGs
`aria-hidden="true"`, Icon-Buttons immer mit `aria-label`. Status wird nie nur über Farbe
transportiert, immer Punkt **und** Wort.

---

# 8. Fallstricke aus der Vorgängerversion

Jeder Punkt hat dort Zeit gekostet. Zwei davon waren Sicherheitslücken.

1. **`security definer` macht `current_user` zum Eigentümer**, nicht zum Aufrufer. Eine
   Prüfung „ist der Aufrufer eine Server-Rolle" traf dadurch immer zu, und jeder Nutzer
   hätte sich zum Plattform-Admin befördern können. Siehe 3.8.
2. **Ein BEFORE-DELETE-Trigger muss `OLD` zurückgeben.** `return new` bricht ab, weil `NEW`
   bei DELETE nicht belegt ist; `return null` verwirft das Löschen stillschweigend. Ebenso
   bricht ein Lesezugriff auf `new.spalte` in einem DELETE-Trigger ab.
3. **Index-Prädikate können `now()` nicht auswerten.** Ein Unique-Index „höchstens eine
   offene Freigabe" blockiert deshalb auch abgelaufene. Lösung: ein Trigger schließt
   abgelaufene Einträge, bevor ein neuer entsteht.
4. **`anon` liefert `42501`, nicht eine leere Liste** — weil der Rolle die Tabellenrechte
   entzogen wurden. Tests müssen das erwarten.
5. **Tests dürfen keine leere Datenbank voraussetzen.** Eine Prüfung zählte alle Betriebe
   und fiel beim ersten echten Betrieb um. Zähle gezielt die Testdaten.
6. **PKCE funktioniert nicht für Einladungen.** Supabase verlinkt voreingestellt auf
   `{{ .ConfirmationURL }}`; der PKCE-Weg braucht einen Prüfwert im Cookie des anfordernden
   Browsers. Eine serverseitig erzeugte Einladung hat den nie gesetzt — sie **muss**
   scheitern, ebenso ein Link, der auf einem anderen Gerät geöffnet wird. Stelle die
   E-Mail-Vorlagen auf
   `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=…` um und werte
   `token_hash` bevorzugt aus. **Die Vorlagen sind erst nach Einrichtung von eigenem SMTP
   editierbar.**
7. **Eingeladene Mitgliedschaften müssen aktiviert werden.** Sie entstehen mit
   `status = 'invited'`, aber `is_member_of()` verlangt `active`. Ohne einen
   Aktivierungsschritt beim ersten Anmelden landet der Eingeladene in einer leeren
   Anwendung. Löse das mit einer `security definer`-Funktion, die **nur** auf `auth.uid()`
   wirkt — nicht mit dem Dienstschlüssel. Der Anmeldeweg ist der letzte Ort, an dem man
   einen Generalschlüssel haben will.
8. **Supabase-Projekteinstellungen sind nicht im Repository.** Die lokale Konfigurationsdatei
   wirkt nur lokal. Redirect-URLs, Selbstregistrierung, Linkdauer, SMTP und Vorlagen werden
   im Dashboard gesetzt und sind bei einem neuen Projekt erneut zu setzen. Dokumentiere sie.
9. **Supabase Free hat zwei harte Grenzen.** Eingebauter Mailversand: 2 Mails pro Stunde
   fürs ganze Projekt, nicht pro Adresse — zwei Einladungen blockieren das Onboarding.
   Sitzungsablauf nach Inaktivität gibt es erst ab Pro; ohne ihn laufen Sitzungen nie ab.
10. **Für Migrationen den Session Pooler nehmen (Port 5432), nicht den Transaction Pooler
    (6543).** Letzterer verteilt Anweisungen über wechselnde Verbindungen; `set local role`
    und Trigger-Operationen scheitern dort — oder werden stillschweigend ignoriert, und
    dann laufen die Sicherheitstests als Tabelleneigentümer, der alle Regeln ohnehin
    umgeht. Ein grüner Lauf, der nichts beweist.

---

# 9. Wie du arbeitest

**Plane zuerst, baue dann.** Leg dir eine Reihenfolge zurecht und zeig sie, bevor du
anfängst.

**Frag nach, statt zu raten**, wenn eine Entscheidung schwer zurückzunehmen ist:
Datenmodell, Zugriffsregeln, externe Dienste, alles mit personenbezogenen Daten. Eine
Frage kostet eine Minute, eine Datenmigration kostet einen Tag. Stell **eine** Frage auf
einmal und schlag eine Antwort vor.

**Halte fest, warum.** Lege eine Datei für Entscheidungen an und schreib zu jeder die
Begründung und das Datum. Nicht *was* entschieden wurde — das sieht man am Code — sondern
*warum*. Das ist der Teil, der in sechs Monaten zählt.

**Sag, was du nicht geprüft hast.** Wenn du etwas gebaut, aber nicht ausgeführt hast,
schreib es hin. Eine ehrliche Lücke ist besser als eine stillschweigende Annahme.

**Bevor etwas „fertig" ist:**
- Build läuft fehlerfrei
- Tests sind grün
- Die SQL-Prüfungen aus 3.10 sind **gegen eine echte Datenbank** gelaufen
- Jede neue Tabelle hat RLS und eine Prüfung, die die Trennung belegt
- Du hast benannt, was ungeprüft blieb
