# Supabase einrichten

> Was im Supabase-Dashboard eingestellt sein muss. `supabase/config.toml` wirkt nur auf
> eine lokale Instanz — das echte Projekt wird hier von Hand konfiguriert.

## 1. E-Mail-Vorlagen auf `token_hash` umstellen (wichtig)

**Authentication → Emails → Templates**

Die Voreinstellung verlinkt auf `{{ .ConfirmationURL }}`. Das führt über den PKCE-Weg und
funktioniert **nur in dem Browser, der die Anmeldung angefordert hat** — dort liegt der
zugehörige Prüfwert in einem Cookie. Zwei Fälle scheitern damit:

- Eine **Einladung**, die serverseitig erzeugt wurde. Der Eingeladene hat nie einen
  Prüfwert gesetzt bekommen, also schlägt das Einlösen fehl.
- Ein Link, der auf einem **anderen Gerät** geöffnet wird — Mail am Handy gelesen, am
  Rechner arbeiten. Die Spec fordert ausdrücklich, dass das funktioniert.

Deshalb in jeder Vorlage den Link ersetzen durch:

| Vorlage | Link |
|---------|------|
| Magic Link | `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink` |
| Invite user | `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite` |
| Confirm signup | `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup` |
| Change email | `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email_change` |
| Reset password | `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery` |

Die Rücklaufseite (`src/app/auth/callback/route.ts`) wertet `token_hash` bevorzugt aus und
fällt auf `code` zurück, falls eine Vorlage noch nicht umgestellt ist.

## 2. Resend als SMTP hinterlegen

Der eingebaute Mailversand von Supabase ist fest auf **2 Mails pro Stunde für das ganze
Projekt** begrenzt — nicht pro Adresse. Zwei Einladungen reichen, um das Onboarding zu
blockieren. Mit eigenem SMTP entfällt die Grenze.

**Bei Resend:** Domain `heidi-hilft.de` hinzufügen, Region **Ireland (eu-west-1)** wählen,
die DNS-Einträge setzen, Verifizierung abwarten. Dann einen API-Key erzeugen.

**In Supabase → Authentication → Emails → SMTP Settings:**

| Feld | Wert |
|------|------|
| Host | `smtp.resend.com` |
| Port | `465` (oder `587`) |
| Username | `resend` |
| Password | der Resend-API-Key |
| Sender email | z. B. `heidi@heidi-hilft.de` |
| Sender name | `Heidi` |

Danach unter **Authentication → Rate Limits** die Versandbremse auf den Wert aus der Spec
setzen: **3 Mails pro Stunde** und *Minimum interval per user* **60 Sekunden** (dieses Feld
wirkt erst mit eigenem SMTP).

**Datenschutzhinweis:** Resends Region steuert nur den Versandort. Kontodaten, Metadaten und
Logs liegen laut Dokumentation in den USA, die Speicherdauer beträgt 30 Tage. Betroffen sind
ausschließlich dienstliche Adressen von Mitarbeitenden der Betriebe, keine Endkundendaten,
und Benachrichtigungen enthalten keine Nachrichteninhalte. Resend gehört in die
Unterauftragnehmerliste und in den AVV (PROJ-10). Siehe `docs/PRD.md`, Abschnitt Constraints.

## 3. Weitere Einstellungen

**Authentication → URL Configuration**
- *Site URL*: lokal `http://localhost:3000`, später die echte Domain
- *Redirect URLs*: `http://localhost:3000/auth/callback` und die Produktionsadresse

**Authentication → Sign In / Providers**
- *Allow new users to sign up*: **aus**. Zugänge entstehen nur durch Einladung
- *Email OTP Expiration*: `3600` Sekunden (60 Minuten)

**Authentication → Sessions**
- *Inactivity timeout*: 30 Tage (720 Stunden) — **erst ab Pro-Plan verfügbar**. Auf dem
  kostenlosen Tarif steht der Wert auf 0, Sitzungen laufen also nie ab. Siehe die
  dokumentierte Abweichung in `features/PROJ-1-...md`

## 4. Erste Einrichtung eines Zugangs

1. **Authentication → Users → Add user → Create new user**, Haken bei *Auto Confirm User*
2. `./scripts/make-platform-admin.sh deine@adresse.de` — die Plattform-Rolle lässt sich
   absichtlich nicht über die Anwendung setzen (Trigger `guard_profile_update`)
3. Anmelden, Betrieb anlegen, erster Kunden-Admin wird automatisch eingeladen

## Nützliche Skripte

| Skript | Zweck |
|--------|-------|
| `./scripts/db-apply.sh` | Migrationen anwenden und im Verlauf eintragen |
| `./scripts/db-apply.sh --with-tests` | zusätzlich die SQL-Prüfungen ausführen |
| `./scripts/db-status.sh` | Betriebe, Profile, Mitgliedschaften und Freigaben anzeigen |
| `./scripts/make-platform-admin.sh <mail>` | Nutzer zum Plattform-Admin machen |
