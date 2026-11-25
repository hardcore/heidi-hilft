#!/usr/bin/env bash
#
# Wendet alle Migrationen aus supabase/migrations auf eine Datenbank an und
# traegt sie in den Supabase-Migrationsverlauf ein, damit ein spaeteres
# `supabase db push` sie nicht erneut anwendet.
#
#   ./scripts/db-apply.sh               nur Migrationen
#   ./scripts/db-apply.sh --with-tests  Migrationen und danach die SQL-Tests
#
# Die Verbindungszeichenfolge kommt aus .env.local (Zeile `DB_URL=postgresql://...`),
# alternativ aus der Umgebung, sonst wird sie verdeckt erfragt. Sie wird nirgends
# ausgegeben - weder im Klartext noch in einer Fehlermeldung. Claude Code darf
# .env* nicht lesen; dieses Skript laeuft in deiner Shell, nicht in Claude Code.
#
# Nimm den Session pooler, nicht den Transaction pooler: Trigger-Definitionen
# und das vorübergehende Abschalten eines Triggers im Test brauchen eine
# Sitzungsverbindung.

set -euo pipefail

cd "$(dirname "$0")/.."

PSQL="${PSQL:-psql}"
if ! command -v "$PSQL" >/dev/null 2>&1; then
  echo "psql nicht gefunden. Setze PSQL=/pfad/zu/psql." >&2
  exit 1
fi

ENV_FILE="${ENV_FILE:-.env.local}"

# Reihenfolge nach Eignung: DB_URL ist die ausdrueckliche Wahl, danach die Namen,
# die die Vercel-Supabase-Integration anlegt. POSTGRES_URL steht zuletzt, weil er
# meist auf den Transaction pooler zeigt.
DB_URL_NAMES="DB_URL SUPABASE_DB_URL DATABASE_URL POSTGRES_URL_NON_POOLING POSTGRES_URL"

# 1. Umgebung  2. .env.local  3. verdeckte Eingabe
if [ -z "${DB_URL:-}" ] && [ -f "$ENV_FILE" ]; then
  for name in $DB_URL_NAMES; do
    value="$(
      grep -m1 -E "^[[:space:]]*(export[[:space:]]+)?${name}[[:space:]]*=" "$ENV_FILE" 2>/dev/null \
        | sed -E 's/^[^=]*=[[:space:]]*//; s/[[:space:]]+$//; s/^"(.*)"$/\1/; s/^'"'"'(.*)'"'"'$/\1/' \
        || true
    )"
    if [ -n "$value" ]; then
      DB_URL="$value"
      # Nur der NAME wird genannt, nie der Wert.
      echo "Verbindung aus ${ENV_FILE} gelesen, Variable ${name} (Wert wird nicht angezeigt)."
      break
    fi
  done
fi

if [ -z "${DB_URL:-}" ]; then
  echo "In ${ENV_FILE} wurde keine dieser Variablen gefunden: ${DB_URL_NAMES}" >&2
  printf 'Supabase Session-Pooler-URL (verdeckt): ' >&2
  read -rs DB_URL
  printf '\n' >&2
fi

if [ -z "${DB_URL:-}" ]; then
  echo "Keine Verbindungszeichenfolge angegeben." >&2
  exit 1
fi

case "$DB_URL" in
  *:6543*)
    echo "Warnung: Port 6543 ist der Transaction pooler. Trigger-Definitionen und" >&2
    echo "das Abschalten eines Triggers im Test brauchen den Session pooler." >&2
    ;;
esac

# Jeder Aufruf bricht bei der ersten Fehlermeldung ab.
run() { "$PSQL" "$DB_URL" -v ON_ERROR_STOP=1 --quiet --no-psqlrc "$@"; }

echo "== Verbindung pruefen =="
run -c "select current_database() as datenbank, current_user as rolle;"

echo
echo "== Migrationsverlauf vorbereiten =="
run -c "create schema if not exists supabase_migrations;"
run -c "create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text);"

applied_any=0
for file in supabase/migrations/*.sql; do
  base="$(basename "$file")"
  version="${base%%_*}"

  if [ -n "$(run -tAc "select 1 from supabase_migrations.schema_migrations where version = '${version}';")" ]; then
    echo "-- ${base}: bereits angewendet, uebersprungen"
    continue
  fi

  echo
  echo "== Anwenden: ${base} =="
  # -1: die ganze Datei in einer Transaktion. Bricht etwas ab, bleibt nichts halb da.
  run -1 -f "$file"
  run -c "insert into supabase_migrations.schema_migrations (version, name) values ('${version}', '${base}');"
  echo "   angewendet und im Verlauf eingetragen"
  applied_any=1
done

echo
echo "== Pflichtpruefung: Tabellen ohne RLS (muss leer sein) =="
run -c "select table_name from public.tables_without_rls();"

if [ "${1:-}" = "--with-tests" ]; then
  echo
  echo "== SQL-Tests (laufen in einer Transaktion und werden zurueckgerollt) =="
  # Ohne ON_ERROR_STOP: pgTAP meldet Fehlschlaege als "not ok" und laeuft weiter.
  "$PSQL" "$DB_URL" --no-psqlrc -f supabase/tests/proj1_rls.test.sql
fi

echo
if [ "$applied_any" = "1" ]; then
  echo "Fertig."
else
  echo "Fertig - es gab keine neuen Migrationen."
fi
