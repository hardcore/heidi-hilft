#!/usr/bin/env bash
#
# Zeigt den Zustand der Heidi-Datenbank: Betriebe, Profile, Mitgliedschaften,
# laufende Support-Freigaben. Nur Stammdaten - keine Nachrichteninhalte.
#
#   ./scripts/db-status.sh
#
# Verbindung wie bei db-apply.sh aus .env.local; der Wert wird nie ausgegeben.

set -euo pipefail

cd "$(dirname "$0")/.."

PSQL="${PSQL:-psql}"
ENV_FILE="${ENV_FILE:-.env.local}"
DB_URL_NAMES="DB_URL SUPABASE_DB_URL DATABASE_URL POSTGRES_URL_NON_POOLING POSTGRES_URL"

if [ -z "${DB_URL:-}" ] && [ -f "$ENV_FILE" ]; then
  for name in $DB_URL_NAMES; do
    value="$(
      grep -m1 -E "^[[:space:]]*(export[[:space:]]+)?${name}[[:space:]]*=" "$ENV_FILE" 2>/dev/null \
        | sed -E 's/^[^=]*=[[:space:]]*//; s/[[:space:]]+$//; s/^"(.*)"$/\1/; s/^'"'"'(.*)'"'"'$/\1/' \
        || true
    )"
    if [ -n "$value" ]; then DB_URL="$value"; break; fi
  done
fi

if [ -z "${DB_URL:-}" ]; then
  echo "Keine Verbindung in ${ENV_FILE} gefunden (${DB_URL_NAMES})." >&2
  exit 1
fi

"$PSQL" "$DB_URL" -v ON_ERROR_STOP=1 --no-psqlrc <<'SQL'
\echo '== Betriebe =='
select name, short_name as kuerzel, status,
       to_char(created_at, 'DD.MM.YYYY HH24:MI') as angelegt
  from public.tenants
 order by created_at;

\echo ''
\echo '== Profile =='
select p.email,
       p.is_platform_admin as plattform_admin,
       to_char(p.created_at, 'DD.MM.YYYY HH24:MI') as angelegt
  from public.profiles p
 order by p.created_at;

\echo ''
\echo '== Mitgliedschaften =='
select t.name as betrieb, p.email, m.role as rolle, m.status,
       to_char(m.first_login_at, 'DD.MM.YYYY HH24:MI') as erste_anmeldung
  from public.memberships m
  join public.tenants t on t.id = m.tenant_id
  join public.profiles p on p.id = m.profile_id
 order by t.name, m.role;

\echo ''
\echo '== Laufende Support-Freigaben =='
select t.name as betrieb,
       to_char(g.expires_at, 'DD.MM.YYYY HH24:MI') as laeuft_bis
  from public.support_grants g
  join public.tenants t on t.id = g.tenant_id
 where g.revoked_at is null and g.expires_at > now();

\echo ''
\echo '== Pflichtpruefung: Tabellen ohne RLS (muss leer sein) =='
select table_name from public.tables_without_rls();
SQL
