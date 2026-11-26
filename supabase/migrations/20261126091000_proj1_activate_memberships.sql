-- PROJ-1: Einladung beim ersten Anmelden aktivieren.
--
-- Beim Anlegen eines Betriebs entsteht die Mitgliedschaft mit Status 'invited'.
-- is_member_of() verlangt 'active' – ohne diesen Schritt käme ein eingeladener
-- Kunden-Admin nach dem Klick auf den Anmeldelink in eine leere Anwendung.
--
-- Warum eine Datenbankfunktion und nicht der Dienstschlüssel:
-- Die Zugriffsregel memberships_update erlaubt Änderungen nur Kunden-Admins des
-- Betriebs – ein gerade erst eingeladener Nutzer ist das noch nicht. Der
-- Dienstschlüssel auf dem Anmeldeweg wäre der bequeme Weg, aber er umgeht ALLE
-- Regeln. Diese Funktion kann genau eine Sache, und nur für den Aufrufer selbst.

create or replace function public.activate_my_memberships()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  betroffen integer;
begin
  if auth.uid() is null then
    raise exception 'Nicht angemeldet' using errcode = 'insufficient_privilege';
  end if;

  -- auth.uid() ist nicht manipulierbar: der Wert kommt aus dem geprüften Token.
  -- Die Funktion kann deshalb keine fremden Mitgliedschaften aktivieren.
  update public.memberships
     set status = 'active',
         first_login_at = coalesce(first_login_at, now())
   where profile_id = auth.uid()
     and status = 'invited';

  get diagnostics betroffen = row_count;
  return betroffen;
end;
$$;

comment on function public.activate_my_memberships() is
  'Setzt die eigenen eingeladenen Mitgliedschaften auf aktiv. Wirkt nur auf auth.uid().';

revoke all on function public.activate_my_memberships() from public;
revoke all on function public.activate_my_memberships() from anon;
grant execute on function public.activate_my_memberships() to authenticated;
