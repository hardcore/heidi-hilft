# Umgebungsvariablen

> Diese Datei beschreibt, welche Variablen gesetzt sein müssen — **nicht** ihre Werte.
> Werte stehen in `.env.local` (lokal) und in den Projekt-Einstellungen bei Vercel.
> `.env*` ist für Claude Code gesperrt: weder lesbar noch schreibbar. Die Werte
> trägt immer ein Mensch ein.

## Pflicht ab PROJ-1

| Variable | Wo sichtbar | Zweck |
|----------|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + Server | Adresse des Supabase-Projekts |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + Server | Öffentlicher Schlüssel. Jede Abfrage damit läuft durch die Zugriffsregeln — genau so ist es gewollt |
| `SUPABASE_SERVICE_ROLE_KEY` | **nur Server** | Dienstschlüssel. Umgeht alle Zugriffsregeln. Nur für Betrieb anlegen und Nutzer einladen |
| `NEXT_PUBLIC_SITE_URL` | Browser + Server | Basis-Adresse für den Rücklauf des Anmeldelinks. Bewusst aus der Konfiguration und nicht aus dem Host-Header, damit die Weiterleitung nicht umgelenkt werden kann |

## Der Dienstschlüssel

`SUPABASE_SERVICE_ROLE_KEY` ist ein Generalschlüssel für **alle** Mandanten. Regeln:

- Niemals mit `NEXT_PUBLIC_` beginnen lassen — sonst landet er im Browser-Bündel
- Nur über `src/lib/supabase/admin.ts` verwenden; die Datei bricht ab, wenn sie
  im Browser ausgeführt wird
- Niemals ins Repository, niemals in einen Chat, niemals in ein Log

## Lokal einrichten

1. `.env.local` im Projektstamm anlegen (ist in `.gitignore`)
2. Die vier Variablen oben eintragen. URL und öffentlicher Schlüssel stehen im
   Supabase-Dashboard unter *Project Settings → API*; der Dienstschlüssel
   ebenfalls dort unter *service_role*
3. `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

## Bei Vercel

Die Supabase-Integration legt die Variablen für *Production* und *Preview* selbst an.
Zwei Dinge sind dort nachzuhalten:

- **Ziel „Development" fehlt.** Die Integration setzt nur *Production* und *Preview*.
  Für `vercel env pull` muss *Development* ergänzt werden, oder `.env.local` wird
  von Hand gepflegt.
- **`NEXT_PUBLIC_SITE_URL` fehlt** und muss je Umgebung eingetragen werden
  (Produktion: die echte Domain; Preview: die Preview-Adresse).

## Später

| Variable | Ab | Zweck |
|----------|-----|-------|
| `D360_API_KEY`, `D360_PARTNER_ID` | PROJ-5 | WhatsApp über 360dialog |
| `D360_WEBHOOK_SECRET` | PROJ-5 | Signaturprüfung der Webhooks |
| `MISTRAL_API_KEY` | PROJ-6 | KI-Antworten (EU) |
| `RESEND_API_KEY` o. Ä. | PROJ-8 | Übergabe-Benachrichtigungen |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | PROJ-11 | Abo |
