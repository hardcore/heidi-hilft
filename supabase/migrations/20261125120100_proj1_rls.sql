-- PROJ-1: Zeilen-Zugriffsregeln (Row Level Security)
--
-- Hier liegt die Mandantentrennung. Nicht in der Anwendung.
-- Eine vergessene Filterbedingung in einer Abfrage ist dadurch harmlos:
-- die Datenbank gibt ohnehin nichts heraus, wofür keine Mitgliedschaft besteht.

-- ---------------------------------------------------------------------------
-- Hilfsfunktionen
--
-- security definer + festes search_path: die Funktionen dürfen die
-- Mitgliedschaftstabelle lesen, ohne selbst wieder durch RLS zu laufen.
-- Ohne das entstünde eine Endlosschleife, sobald eine Regel auf memberships prüft.
-- ---------------------------------------------------------------------------

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select p.is_platform_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- Mitgliedschaft unabhängig vom Zustand des Betriebs.
-- Nötig, damit ein Mitglied die Hinweisseite "Betrieb gesperrt" überhaupt sehen kann.
create or replace function public.is_member_of_any_status(target_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.memberships m
    where m.tenant_id = target_tenant
      and m.profile_id = auth.uid()
  );
$$;

-- Mitgliedschaft für den Datenzugriff: aktive Mitgliedschaft UND aktiver Betrieb.
create or replace function public.is_member_of(target_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.memberships m
    join public.tenants t on t.id = m.tenant_id
    where m.tenant_id = target_tenant
      and m.profile_id = auth.uid()
      and m.status = 'active'
      and t.status = 'active'
  );
$$;

create or replace function public.has_tenant_role(target_tenant uuid, needed membership_role)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.memberships m
    join public.tenants t on t.id = m.tenant_id
    where m.tenant_id = target_tenant
      and m.profile_id = auth.uid()
      and m.status = 'active'
      and m.role = needed
      and t.status = 'active'
  );
$$;

-- Laufende, nicht widerrufene Support-Freigabe. Gilt nur für Plattform-Admins.
create or replace function public.has_support_access(target_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_platform_admin() and exists (
    select 1 from public.support_grants g
    where g.tenant_id = target_tenant
      and g.revoked_at is null
      and g.expires_at > now()
  );
$$;

-- DIE Funktion für alle künftigen Inhaltstabellen (Wissen, Nachrichten, Gespräche, Termine).
-- Läuft die Freigabe ab, endet der Zugriff von selbst – es gibt keinen Schalter,
-- dessen Umlegen man vergessen könnte.
create or replace function public.can_read_tenant_content(target_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_member_of(target_tenant) or public.has_support_access(target_tenant);
$$;

comment on function public.can_read_tenant_content(uuid) is
  'Konvention für jede Tabelle mit Kundendaten: USING (can_read_tenant_content(tenant_id)).';

-- Teilt der Anfragende mindestens einen Betrieb mit dem Zielprofil?
-- Nötig, damit Teamlisten funktionieren, ohne fremde Profile zu öffnen.
create or replace function public.shares_tenant_with(target_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.memberships mine
    join public.memberships theirs on theirs.tenant_id = mine.tenant_id
    where mine.profile_id = auth.uid()
      and theirs.profile_id = target_profile
  );
$$;

-- ---------------------------------------------------------------------------
-- Rechte: anon bekommt nichts. authenticated bekommt Zugriff, den RLS dann filtert.
-- ---------------------------------------------------------------------------

revoke all on public.tenants        from anon;
revoke all on public.profiles       from anon;
revoke all on public.memberships    from anon;
revoke all on public.support_grants from anon;
revoke all on public.access_log     from anon;

grant select, insert, update on public.tenants        to authenticated;
grant select, update          on public.profiles       to authenticated;
grant select, insert, update, delete on public.memberships to authenticated;
grant select, insert, update on public.support_grants to authenticated;
grant select, insert          on public.access_log     to authenticated;

-- Append-only: ausdrücklich kein UPDATE/DELETE auf dem Protokoll, für niemanden.
revoke update, delete on public.access_log from authenticated;

-- ---------------------------------------------------------------------------
-- RLS aktivieren. force row level security gilt auch für den Tabelleneigentümer.
-- ---------------------------------------------------------------------------

alter table public.tenants        enable row level security;
alter table public.profiles       enable row level security;
alter table public.memberships    enable row level security;
alter table public.support_grants enable row level security;
alter table public.access_log     enable row level security;

-- ---------------------------------------------------------------------------
-- tenants
-- ---------------------------------------------------------------------------

create policy tenants_select on public.tenants
  for select to authenticated
  using (public.is_member_of_any_status(id) or public.is_platform_admin());

create policy tenants_insert on public.tenants
  for insert to authenticated
  with check (public.is_platform_admin());

create policy tenants_update on public.tenants
  for update to authenticated
  using (public.is_platform_admin() or public.has_tenant_role(id, 'tenant_admin'))
  with check (public.is_platform_admin() or public.has_tenant_role(id, 'tenant_admin'));

-- Kein DELETE: Betriebe werden gesperrt, nicht gelöscht. Löschung läuft über PROJ-10.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.shares_tenant_with(id)
    or public.is_platform_admin()
  );

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Kein INSERT: Profile entstehen ausschließlich über den Trigger an auth.users.

-- Selbstbeförderung verhindern: is_platform_admin darf nur serverseitig
-- (Dienstschlüssel) geändert werden, und last_tenant_id nur auf einen Betrieb,
-- in dem eine Mitgliedschaft besteht.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
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

create trigger profiles_guard_update
  before update on public.profiles
  for each row
  when (current_setting('role', true) is distinct from 'service_role')
  execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- memberships
-- ---------------------------------------------------------------------------

create policy memberships_select on public.memberships
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.is_member_of_any_status(tenant_id)
    or public.is_platform_admin()
  );

create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (
    public.has_tenant_role(tenant_id, 'tenant_admin')
    or public.is_platform_admin()
  );

create policy memberships_update on public.memberships
  for update to authenticated
  using (
    public.has_tenant_role(tenant_id, 'tenant_admin')
    or public.is_platform_admin()
  )
  with check (
    public.has_tenant_role(tenant_id, 'tenant_admin')
    or public.is_platform_admin()
  );

create policy memberships_delete on public.memberships
  for delete to authenticated
  using (
    public.has_tenant_role(tenant_id, 'tenant_admin')
    or public.is_platform_admin()
  );

-- ---------------------------------------------------------------------------
-- support_grants
-- ---------------------------------------------------------------------------

create policy support_grants_select on public.support_grants
  for select to authenticated
  using (public.is_member_of_any_status(tenant_id) or public.is_platform_admin());

-- Nur ein Kunden-Admin gibt frei. Ein Mitarbeiter kann das nicht,
-- und ein Plattform-Admin kann sich den Zugriff nicht selbst erteilen.
create policy support_grants_insert on public.support_grants
  for insert to authenticated
  with check (
    public.has_tenant_role(tenant_id, 'tenant_admin')
    and granted_by = auth.uid()
  );

create policy support_grants_revoke on public.support_grants
  for update to authenticated
  using (public.has_tenant_role(tenant_id, 'tenant_admin'))
  with check (public.has_tenant_role(tenant_id, 'tenant_admin'));

-- Fenster serverseitig auf 24 Stunden festnageln, unabhängig davon,
-- was die Anwendung mitschickt.
create or replace function public.pin_support_grant_window()
returns trigger
language plpgsql
as $$
begin
  new.granted_at := now();
  new.expires_at := now() + interval '24 hours';
  new.revoked_at := null;
  return new;
end;
$$;

create trigger support_grants_pin_window
  before insert on public.support_grants
  for each row execute function public.pin_support_grant_window();

-- Beim Widerrufen darf nur revoked_at gesetzt werden – nicht verlängert.
create or replace function public.guard_support_grant_update()
returns trigger
language plpgsql
as $$
begin
  if new.tenant_id is distinct from old.tenant_id
     or new.granted_by is distinct from old.granted_by
     or new.granted_at is distinct from old.granted_at
     or new.expires_at is distinct from old.expires_at then
    raise exception 'Eine Freigabe kann nur widerrufen, nicht verändert werden'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

create trigger support_grants_guard_update
  before update on public.support_grants
  for each row execute function public.guard_support_grant_update();

-- ---------------------------------------------------------------------------
-- access_log – append-only
-- ---------------------------------------------------------------------------

create policy access_log_select on public.access_log
  for select to authenticated
  using (public.is_member_of_any_status(tenant_id) or public.is_platform_admin());

create policy access_log_insert on public.access_log
  for insert to authenticated
  with check (
    (public.is_member_of_any_status(tenant_id) or public.is_platform_admin())
    and actor_id = auth.uid()
  );

-- Bewusst KEINE Regel für UPDATE und DELETE. Ohne Regel ist die Operation verboten –
-- auch für AWSMD. Ein Protokoll, das der Protokollierte löschen kann, ist kein Protokoll.

-- ---------------------------------------------------------------------------
-- Selbstprüfung: Welche Tabelle in public hat kein aktives RLS?
-- Wird vom Test (supabase/tests/proj1_rls.test.sql) und von der CI aufgerufen.
-- ---------------------------------------------------------------------------

create or replace function public.tables_without_rls()
returns table (table_name text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select c.relname::text
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and not c.relrowsecurity
  order by c.relname;
$$;

comment on function public.tables_without_rls() is
  'Liefert jede Tabelle in public ohne aktives RLS. Muss immer leer sein – wird im Test geprüft.';
