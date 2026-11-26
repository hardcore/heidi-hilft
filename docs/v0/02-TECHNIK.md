# Heidi — Technik

> Was gebaut ist, nach welchen Mustern, und welche Fallen schon zugeschnappt sind.
> Stand 2026-11-26.

## Stack

| Baustein | Wahl | Warum |
|----------|------|-------|
| Framework | Next.js 16, App Router, TypeScript | |
| Oberfläche | Tailwind + shadcn/ui | Komponenten liegen in `src/components/ui/`, werden nie nachgebaut |
| Formulare | react-hook-form + Zod | Zod-Schemata in `src/lib/validation/schemas.ts`, serverseitig **und** im Browser |
| Datenbank | Supabase PostgreSQL, Region **Frankfurt (eu-central-1)** | DSGVO |
| Anmeldung | Supabase Auth, **Magic Link ohne Passwort** | Kein Zurücksetzen, keine schwachen Passwörter, Einladung ist derselbe Mechanismus |
| Suche im Wissen | pgvector (ab PROJ-4) | |
| KI | Mistral (EU) mit RAG | EU-Vertrag, günstig genug für die Zielkosten |
| Warteschlange | Tabelle `message_queue` + Supabase Edge Function (ab PROJ-5) | Kein weiterer Dienstleister, kein weiterer AVV |
| Mailversand | Resend als Custom SMTP in Supabase | |
| Hosting | Vercel | |
| Tests | Vitest (Anwendung), pgTAP (Datenbank), Playwright (vorbereitet) | |

## Verzeichnisse

```
src/
  app/
    (app)/                    geschützter Bereich, Zugangskontrolle im layout.tsx
      page.tsx                Startseite
      verwaltung/betriebe/    nur Plattform-Admin
      einstellungen/zugriff/  nur Kunden-Admin
    anmelden/                 öffentlich
    auth/callback/            Rücklauf des Anmeldelinks
    kein-betrieb/             Hinweisseite ohne Mitgliedschaft
    betrieb-gesperrt/         Hinweisseite für gesperrte Betriebe
    api/                      Route Handler
  components/
    ui/                       shadcn — NIE nachbauen
    *.tsx                     eigene Bausteine
  lib/
    supabase/
      server.ts               für Server-Komponenten und Route Handler
      client.ts               für den Browser
      admin.ts                Dienstschlüssel, bricht im Browser ab
      middleware.ts           Sitzung erneuern
      types.ts                Datenbanktypen
    auth/session.ts           getSessionContext, Rollenprüfungen
    auth/audit.ts             Zugriffsprotokoll
    validation/schemas.ts     Zod
    api/respond.ts            einheitliche Antworten und Fehler
  middleware.ts
supabase/
  migrations/                 durchnummeriert, werden nie nachträglich geändert
  tests/proj1_rls.test.sql    pgTAP
  config.toml                 wirkt nur lokal
scripts/
  db-apply.sh                 Migrationen anwenden, --with-tests führt die Prüfungen aus
  db-status.sh                Betriebe, Profile, Mitgliedschaften anzeigen
  make-platform-admin.sh      Plattform-Rolle setzen
docs/, features/
```

## Datenmodell

Alle Tabellen in `public`, alle mit aktivem RLS.

**`tenants`** — ein Betrieb, die Mandanten-Wurzel
`id`, `name`, `short_name` (1–4 Zeichen, Kürzel), `status` (`active` | `suspended`),
`created_at`, `updated_at`

**`profiles`** — ein Mensch mit Zugang, `id` ist identisch mit `auth.users.id`
`email`, `full_name`, `is_platform_admin`, `last_tenant_id`, Zeitstempel
Entsteht automatisch per Trigger `on_auth_user_created`.

**`memberships`** — die eigentliche Berechtigung, n:m zwischen Profil und Betrieb
`tenant_id`, `profile_id`, `role` (`tenant_admin` | `tenant_member`),
`status` (`invited` | `active`), `invited_at`, `first_login_at`
Eindeutig je `(tenant_id, profile_id)`.

**`support_grants`** — befristeter Inhaltszugriff für AWSMD
`tenant_id`, `granted_by`, `granted_at`, `expires_at`, `revoked_at`
Das 24-Stunden-Fenster setzt ein Trigger, nicht die Anwendung.

**`access_log`** — **nur anfügbar**
`tenant_id`, `actor_id`, `actor_email`, `as_platform_admin`, `area`, `action`, `occurred_at`
Keine Regel für UPDATE und DELETE — ohne Regel ist die Operation verboten, auch für AWSMD.

## So baust du eine neue Tabelle

Das ist das wichtigste Muster in diesem Projekt. Jede Tabelle mit Kundendaten folgt ihm.

```sql
create table public.beispiel (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  -- ... fachliche Spalten
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

Lesen über `can_read_tenant_content()`, Schreiben über `is_member_of()`. Der Unterschied:
Lesen erlaubt zusätzlich eine laufende Support-Freigabe, Schreiben nie.

### Vorhandene Hilfsfunktionen

| Funktion | Liefert |
|----------|---------|
| `is_platform_admin()` | ist der Aufrufer AWSMD-Admin |
| `is_member_of(tenant)` | aktive Mitgliedschaft **und** aktiver Betrieb |
| `is_member_of_any_status(tenant)` | Mitgliedschaft unabhängig vom Zustand (für die Hinweisseite „gesperrt") |
| `has_tenant_role(tenant, rolle)` | Mitgliedschaft mit genau dieser Rolle |
| `has_support_access(tenant)` | laufende, nicht widerrufene Freigabe **und** Plattform-Admin |
| `can_read_tenant_content(tenant)` | `is_member_of` **oder** `has_support_access` |
| `shares_tenant_with(profil)` | gemeinsamer Betrieb — für Teamlisten |
| `tables_without_rls()` | jede Tabelle ohne RLS. **Muss immer leer sein** |
| `activate_my_memberships()` | setzt die eigenen eingeladenen Mitgliedschaften aktiv |

Alle außer der letzten sind `stable security definer` mit festem `search_path`. Das ist
nötig, damit sie die Mitgliedschaftstabelle lesen können, ohne selbst wieder durch RLS zu
laufen — sonst entstünde eine Endlosschleife.

### Und jede neue Tabelle bekommt eine Prüfung

In `supabase/tests/proj1_rls.test.sql` (oder einer eigenen Datei) mindestens:
ein Mitglied von Betrieb A sieht nichts von Betrieb B, und ein Schreibversuch nach B
scheitert mit `42501`. Plus die Planzahl oben anpassen.

## Migrationen

- Dateiname `JJJJMMTTHHMMSS_beschreibung.sql`, aufsteigend
- **Eine angewendete Migration wird nie mehr geändert.** Korrekturen kommen in eine neue
- Anwenden: `./scripts/db-apply.sh` — trägt sie auch in
  `supabase_migrations.schema_migrations` ein, damit `supabase db push` sie nicht erneut
  ausführt
- Mit Prüfungen: `./scripts/db-apply.sh --with-tests`
- Die Verbindung liest das Skript selbst aus `.env.local`
  (`POSTGRES_URL_NON_POOLING` oder `DB_URL`) und gibt sie nie aus

**Nimm den Session pooler (Port 5432), nicht den Transaction pooler (6543).** Der
Transaction Pooler verteilt Anweisungen über wechselnde Verbindungen; `set local role`,
Trigger-Definitionen und das Abschalten eines Triggers im Test scheitern dort — oder,
schlimmer, werden stillschweigend ignoriert, und die Tests laufen als Eigentümer, der alle
Zugriffsregeln ohnehin umgeht. Ein grüner Lauf, der nichts beweist.

## API-Routen

| Route | Methode | Wer darf |
|-------|---------|----------|
| `/api/auth/magic-link` | POST | offen. Antwortet für unbekannte und bekannte Adressen **identisch** |
| `/api/auth/abmelden` | POST | angemeldet |
| `/api/session` | GET | offen, liefert `authenticated: false` ohne Anmeldung |
| `/api/tenants/switch` | POST | Mitglied des Zielbetriebs oder Plattform-Admin |
| `/api/admin/tenants` | GET, POST | nur Plattform-Admin |
| `/api/support-grants` | POST, DELETE | nur Kunden-Admin des Betriebs |
| `/api/access-log` | GET | Mitglied oder Plattform-Admin |

**Muster für jede neue Route:** Zod-Prüfung der Eingabe, `requireSession()`, Rollenprüfung,
Arbeit, `handleError()` im `catch`. Statuscodes: 400 ungültige Eingabe, 401 nicht
angemeldet, 403 falsche Rolle oder fremder Betrieb, 404 nicht gefunden, 409 Konflikt,
429 zu viele Anfragen.

Server-Komponenten lesen direkt über den Supabase-Client dieser Anfrage — dieselben
Zugriffsregeln, ein HTTP-Umweg weniger. Schreibende Vorgänge aus dem Browser gehen über
Route Handler.

## Zugangskontrolle in drei Schichten

1. **Middleware** (`src/middleware.ts`) erneuert die Sitzung bei jeder Anfrage und schickt
   Nicht-Angemeldete zur Anmeldung, mit der Zielseite als `weiter`-Parameter
2. **Layout** des geschützten Bereichs entscheidet über Mitgliedschaft und Betriebszustand
   und leitet auf die passende Hinweisseite
3. **Zugriffsregeln der Datenbank** — die eigentliche Sicherung

Die oberen zwei sorgen dafür, dass der Nutzer eine sinnvolle Seite sieht statt einer leeren
Liste. Sie sind Komfort, nicht Schutz.

Überall `supabase.auth.getUser()`, nie `getSession()`: `getSession()` vertraut dem Cookie,
`getUser()` prüft das Token gegen Supabase.

## Umgebungsvariablen

Vollständig in `docs/environment.md`. Kurz:

| Variable | Sichtbar | Zweck |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + Server | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + Server | läuft durch die Zugriffsregeln |
| `SUPABASE_SERVICE_ROLE_KEY` | **nur Server** | umgeht alle Regeln. Nur Betrieb anlegen und einladen |
| `NEXT_PUBLIC_SITE_URL` | Browser + Server | Basis für den Rücklauf des Anmeldelinks — bewusst aus der Konfiguration, nicht aus dem Host-Header, sonst wäre es eine offene Weiterleitung |
| `POSTGRES_URL_NON_POOLING` | nur lokal | für die Migrationsskripte, gehört nicht zu Vercel |

## Einrichtung im Supabase-Dashboard

Vollständig in `docs/supabase-setup.md`. Das Wichtigste:

- **URL Configuration:** Redirect-URL `…/auth/callback` eintragen, sonst scheitert jeder
  Anmeldelink
- **Sign In / Providers:** „Allow new users to sign up" **aus**. Zugänge entstehen nur
  durch Einladung
- **E-Mail-Vorlagen** auf `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=…`
  umstellen — Begründung unten. Nur nach SMTP-Einrichtung editierbar
- **SMTP:** Resend, `smtp.resend.com`, Benutzer `resend`, Passwort der API-Key

## Fallstricke, die hier schon zugeschnappt sind

Jeder dieser Punkte hat Zeit gekostet. Lies sie, bevor du dieselbe Grube ausgräbst.

**1. `security definer` macht `current_user` zum Eigentümer.**
Eine Trigger-Funktion prüfte `current_user in ('postgres','service_role')`, um
serverseitige Rollen durchzulassen. In einer SECURITY-DEFINER-Funktion ist `current_user`
aber der *Eigentümer* der Funktion, nicht der Aufrufer — die Bedingung traf immer zu, und
**jeder Nutzer hätte sich selbst zum Plattform-Admin befördern können**. Richtig ist
`security invoker`, wenn die Funktion die aufrufende Rolle kennen muss.

**2. Ein BEFORE-DELETE-Trigger muss `OLD` zurückgeben.**
`return new` bricht ab (NEW ist bei DELETE nicht belegt), und `return null` verwirft das
Löschen stillschweigend. Ebenso: `new.spalte` in einem DELETE-Trigger lesen bricht ab —
nimm `old`, oder verzweige über `tg_op`.

**3. Index-Prädikate können `now()` nicht auswerten.**
Ein Unique-Index „höchstens eine offene Freigabe" über `where revoked_at is null` blockiert
auch *abgelaufene* Freigaben, weil die Zeit im Prädikat nicht vorkommen darf. Lösung: ein
Trigger schließt abgelaufene Einträge, bevor ein neuer entsteht.

**4. `anon` liefert „permission denied", nicht eine leere Liste.**
Weil der Rolle in der Migration alle Tabellenrechte entzogen wurden, scheitert sie schon am
Tabellenzugriff. Tests müssen `42501` erwarten, nicht `is_empty`.

**5. Tests dürfen keine leere Datenbank voraussetzen.**
Eine Prüfung zählte alle Betriebe und war grün, solange nichts in der Datenbank stand — und
fiel beim ersten echten Betrieb um. Zähle gezielt die Testdaten.

**6. PKCE funktioniert nicht für Einladungen.**
Supabase verlinkt voreingestellt auf `{{ .ConfirmationURL }}`, was über den PKCE-Weg läuft.
Der braucht einen Prüfwert im Cookie des anfordernden Browsers. Eine serverseitig erzeugte
Einladung hat den nie gesetzt, also **muss** sie scheitern — und ein Link, der auf einem
anderen Gerät geöffnet wird, ebenso. Lösung: Vorlagen auf `token_hash` umstellen; die
Rücklaufseite wertet `token_hash` bevorzugt aus.

**7. Eingeladene Mitgliedschaften müssen aktiviert werden.**
Sie entstehen mit `status = 'invited'`, aber `is_member_of()` verlangt `active`. Ohne den
Aufruf von `activate_my_memberships()` in der Rücklaufseite landet ein frisch Eingeladener
in einer leeren Anwendung.

**8. psql ersetzt `:'variable'` nicht überall.**
Weder bei `-c` noch innerhalb eines Dollar-Quote-Blocks. Nur über die Standardeingabe.

**9. `supabase/config.toml` wirkt nur lokal.**
Alles am echten Projekt wird im Dashboard eingestellt. Wer die Datei ändert und meint,
damit sei die Produktion konfiguriert, irrt.

**10. Supabase Free hat zwei harte Grenzen.**
Eingebauter Mailversand: 2 Mails pro Stunde fürs **ganze Projekt**, nicht pro Adresse.
Sitzungssteuerung (Ablauf nach Inaktivität) erst ab Pro — Sitzungen laufen derzeit nie ab.

## Prüfen, bevor du „fertig" sagst

```bash
npm run build                      # muss fehlerfrei durchlaufen
npm test                           # Vitest
./scripts/db-apply.sh --with-tests # Migrationen und SQL-Prüfungen
./scripts/db-status.sh             # Zustand ansehen
```

`npm run lint` ist derzeit kaputt (Next 16 hat `next lint` entfernt, ESLint 9 braucht eine
Flat-Config). Altlast des Starter-Kits, nicht von diesem Projekt verursacht.
