-- PROJ-1, Korrektur: guard_profile_update war wirkungslos.
--
-- Fehler: Die Funktion war `security definer`. In einer SECURITY-DEFINER-Funktion
-- liefert current_user den EIGENTÜMER der Funktion (postgres), nicht die aufrufende
-- Rolle. Die Abkürzung
--
--     if current_user in ('postgres', 'supabase_admin', 'service_role') then
--       return new;
--     end if;
--
-- traf damit IMMER zu. Jeder angemeldete Nutzer konnte sein eigenes
-- is_platform_admin auf true setzen und sich damit zum AWSMD-Admin befördern,
-- und last_tenant_id auf einen fremden Betrieb stellen.
--
-- Gefunden durch die SQL-Prüfungen 14 und 15 beim ersten Lauf gegen eine echte
-- Datenbank.
--
-- Korrektur: `security invoker` (Voreinstellung). Dann ist current_user die
-- aufrufende Rolle — 'authenticated' für Anwendungsnutzer, 'service_role' für den
-- Dienstschlüssel, 'postgres' für psql. Definer-Rechte braucht die Funktion nicht:
-- sie liest nur is_member_of_any_status() (selbst security definer) und wirft Fehler.

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  -- Serverseitige Rollen dürfen alles. current_user ist hier die AUFRUFENDE Rolle,
  -- weil die Funktion security invoker ist. Mit security definer wäre es der
  -- Eigentümer und die Prüfung damit immer wahr.
  if current_user in ('postgres', 'supabase_admin', 'service_role') then
    return new;
  end if;

  if new.is_platform_admin is distinct from old.is_platform_admin then
    raise exception 'is_platform_admin kann nicht über die Anwendung geändert werden'
      using errcode = 'insufficient_privilege';
  end if;

  if new.id is distinct from old.id then
    raise exception 'Die Profilkennung ist unveränderlich'
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
end;
$$;
