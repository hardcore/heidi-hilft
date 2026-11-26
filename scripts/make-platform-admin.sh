#!/usr/bin/env bash
#
# Macht einen bestehenden Nutzer zum Plattform-Admin (AWSMD-Ebene).
#
#   ./scripts/make-platform-admin.sh deine@adresse.de
#
# Voraussetzung: Der Nutzer existiert bereits in Supabase Auth. Anlegen im
# Dashboard unter Authentication -> Users. Diese Rolle laesst sich absichtlich
# NICHT ueber die Anwendung setzen (Trigger guard_profile_update) - nur
# serverseitig, also hier.
#
# Die Verbindung kommt wie bei db-apply.sh aus .env.local und wird nie ausgegeben.

set -euo pipefail

cd "$(dirname "$0")/.."

EMAIL="${1:-}"
if [ -z "$EMAIL" ]; then
  echo "Aufruf: ./scripts/make-platform-admin.sh <e-mail-adresse>" >&2
  exit 1
fi

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

"$PSQL" "$DB_URL" -v ON_ERROR_STOP=1 --no-psqlrc -v email="$EMAIL" <<'SQL'
\set ON_ERROR_STOP on

do $$
declare
  ziel uuid;
begin
  select id into ziel from public.profiles where lower(email) = lower(:'email');

  if ziel is null then
    raise exception 'Kein Profil zu dieser Adresse. Lege den Nutzer zuerst im Supabase-Dashboard unter Authentication -> Users an.';
  end if;

  update public.profiles set is_platform_admin = true where id = ziel;
end;
$$;

select email, is_platform_admin as plattform_admin
  from public.profiles
 where lower(email) = lower(:'email');
SQL
