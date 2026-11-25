-- PROJ-1: Tests für Mandantentrennung und Rollengrenzen
--
-- Ausführen:
--   supabase test db                        (lokal, benötigt Docker)
--   psql "$DATABASE_URL" -f diese_datei     (gegen ein Testprojekt)
--
-- Die Tests laufen in einer Transaktion und werden am Ende zurückgerollt –
-- sie hinterlassen keine Daten.

begin;

create extension if not exists pgtap with schema extensions;

select plan(24);

-- ---------------------------------------------------------------------------
-- Testdaten
-- ---------------------------------------------------------------------------

-- Zwei Betriebe
insert into public.tenants (id, name, short_name) values
  ('11111111-1111-1111-1111-111111111111', 'Fahrschule Alpha', 'FA'),
  ('22222222-2222-2222-2222-222222222222', 'Fahrschule Beta',  'FB');

-- Ein gesperrter Betrieb
insert into public.tenants (id, name, short_name, status) values
  ('33333333-3333-3333-3333-333333333333', 'Fahrschule Gamma', 'FG', 'suspended');

-- Vier Nutzer. auth.users-Einträge lösen den Trigger aus, der die Profile anlegt.
insert into auth.users (id, email, instance_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin.alpha@example.test',  '00000000-0000-0000-0000-000000000000'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'member.alpha@example.test', '00000000-0000-0000-0000-000000000000'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'admin.beta@example.test',   '00000000-0000-0000-0000-000000000000'),
  ('cccccccc-0000-0000-0000-000000000001', 'awsmd@example.test',        '00000000-0000-0000-0000-000000000000');

-- Der Plattform-Admin
update public.profiles set is_platform_admin = true
  where id = 'cccccccc-0000-0000-0000-000000000001';

-- Mitgliedschaften
insert into public.memberships (tenant_id, profile_id, role, status) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'tenant_admin',  'active'),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000002', 'tenant_member', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000001', 'tenant_admin',  'active'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000001', 'tenant_admin',  'active');

-- Protokolleinträge, einer je Betrieb
insert into public.access_log (tenant_id, actor_id, actor_email, area, action) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'admin.alpha@example.test', 'login', 'login'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000001', 'admin.beta@example.test',  'login', 'login');

-- ---------------------------------------------------------------------------
-- Hilfsprozedur: als bestimmter Nutzer auftreten
-- ---------------------------------------------------------------------------

create or replace function pg_temp.act_as(user_id uuid)
returns void
language plpgsql
as $$
begin
  execute format('set local role authenticated');
  execute format('set local request.jwt.claims to %L',
                 json_build_object('sub', user_id::text, 'role', 'authenticated')::text);
end;
$$;

create or replace function pg_temp.act_as_anon()
returns void
language plpgsql
as $$
begin
  execute 'set local role anon';
  execute format('set local request.jwt.claims to %L', '{"role":"anon"}');
end;
$$;

-- ===========================================================================
-- 1. Grundsatz: Jede Tabelle in public hat RLS
-- ===========================================================================

select is_empty(
  'select table_name from public.tables_without_rls()',
  'Keine Tabelle in public ohne aktives RLS'
);

-- ===========================================================================
-- 2. Mandantentrennung
-- ===========================================================================

select pg_temp.act_as('aaaaaaaa-0000-0000-0000-000000000001');

select results_eq(
  'select count(*)::int from public.tenants',
  array[2],
  'Alpha-Admin sieht genau seine zwei Betriebe (Alpha und den gesperrten Gamma), nicht Beta'
);

select is_empty(
  $$select id from public.tenants where id = '22222222-2222-2222-2222-222222222222'$$,
  'Alpha-Admin erhält auf die Kennung von Beta kein Ergebnis'
);

select is_empty(
  $$select id from public.access_log where tenant_id = '22222222-2222-2222-2222-222222222222'$$,
  'Alpha-Admin sieht keine Protokolleinträge von Beta'
);

select is_empty(
  $$select id from public.memberships where tenant_id = '22222222-2222-2222-2222-222222222222'$$,
  'Alpha-Admin sieht keine Mitgliedschaften von Beta'
);

select is_empty(
  $$select id from public.profiles where id = 'bbbbbbbb-0000-0000-0000-000000000001'$$,
  'Alpha-Admin sieht das Profil des Beta-Admins nicht'
);

-- Schreiben in einen fremden Betrieb
select throws_ok(
  $$insert into public.memberships (tenant_id, profile_id, role, status)
    values ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-0000-0000-000000000002', 'tenant_member', 'invited')$$,
  '42501',
  null,
  'Alpha-Admin kann in Beta keine Mitgliedschaft anlegen'
);

-- ===========================================================================
-- 3. Anonym: gar nichts
-- ===========================================================================

select pg_temp.act_as_anon();

select is_empty('select id from public.tenants',        'Anonym sieht keine Betriebe');
select is_empty('select id from public.memberships',    'Anonym sieht keine Mitgliedschaften');
select is_empty('select id from public.access_log',     'Anonym sieht kein Zugriffsprotokoll');

-- ===========================================================================
-- 4. Rollengrenzen
-- ===========================================================================

select pg_temp.act_as('aaaaaaaa-0000-0000-0000-000000000002');  -- Mitarbeiter

select throws_ok(
  $$insert into public.memberships (tenant_id, profile_id, role, status)
    values ('11111111-1111-1111-1111-111111111111', 'cccccccc-0000-0000-0000-000000000001', 'tenant_member', 'invited')$$,
  '42501',
  null,
  'Mitarbeiter kann niemanden in seinen eigenen Betrieb einladen'
);

select throws_ok(
  $$insert into public.support_grants (tenant_id, granted_by, expires_at)
    values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000002', now() + interval '24 hours')$$,
  '42501',
  null,
  'Mitarbeiter kann keinen Support-Einblick freigeben'
);

select results_eq(
  'select count(*)::int from public.tenants',
  array[1],
  'Mitarbeiter sieht nur seinen einen Betrieb'
);

-- Selbstbeförderung zum Plattform-Admin
select throws_ok(
  $$update public.profiles set is_platform_admin = true where id = 'aaaaaaaa-0000-0000-0000-000000000002'$$,
  '42501',
  null,
  'Nutzer kann sich nicht selbst zum Plattform-Admin machen'
);

-- Wechsel in einen Betrieb ohne Mitgliedschaft
select throws_ok(
  $$update public.profiles
      set last_tenant_id = '22222222-2222-2222-2222-222222222222'
    where id = 'aaaaaaaa-0000-0000-0000-000000000002'$$,
  '42501',
  null,
  'Nutzer kann nicht in einen Betrieb wechseln, in dem er kein Mitglied ist'
);

-- ===========================================================================
-- 5. Protokoll ist nur anfügbar
-- ===========================================================================

select pg_temp.act_as('aaaaaaaa-0000-0000-0000-000000000001');

select throws_ok(
  $$delete from public.access_log where tenant_id = '11111111-1111-1111-1111-111111111111'$$,
  '42501',
  null,
  'Kunden-Admin kann Protokolleinträge nicht löschen'
);

select throws_ok(
  $$update public.access_log set area = 'manipuliert'
     where tenant_id = '11111111-1111-1111-1111-111111111111'$$,
  '42501',
  null,
  'Kunden-Admin kann Protokolleinträge nicht ändern'
);

-- ===========================================================================
-- 6. Letzter Kunden-Admin
-- ===========================================================================

select throws_like(
  $$delete from public.memberships
     where tenant_id = '11111111-1111-1111-1111-111111111111'
       and profile_id = 'aaaaaaaa-0000-0000-0000-000000000001'$$,
  '%letzte Kunden-Admin%',
  'Der letzte Kunden-Admin eines Betriebs kann nicht entfernt werden'
);

-- ===========================================================================
-- 7. Plattform-Admin: Zahlen ja, Inhalte nur mit Freigabe
-- ===========================================================================

select pg_temp.act_as('cccccccc-0000-0000-0000-000000000001');

select results_eq(
  'select count(*)::int from public.tenants',
  array[3],
  'Plattform-Admin sieht alle Betriebe'
);

select ok(
  not public.can_read_tenant_content('22222222-2222-2222-2222-222222222222'),
  'Ohne Freigabe hat der Plattform-Admin keinen Zugriff auf Inhalte von Beta'
);

select throws_ok(
  $$insert into public.support_grants (tenant_id, granted_by, expires_at)
    values ('22222222-2222-2222-2222-222222222222', 'cccccccc-0000-0000-0000-000000000001', now() + interval '24 hours')$$,
  '42501',
  null,
  'Plattform-Admin kann sich den Einblick nicht selbst erteilen'
);

-- Der Kunden-Admin von Beta gibt frei
select pg_temp.act_as('bbbbbbbb-0000-0000-0000-000000000001');
insert into public.support_grants (tenant_id, granted_by, expires_at)
  values ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000001', now() + interval '1 minute');

select results_eq(
  $$select (expires_at - granted_at) from public.support_grants
     where tenant_id = '22222222-2222-2222-2222-222222222222'$$,
  array[interval '24 hours'],
  'Das Freigabefenster wird serverseitig auf 24 Stunden gesetzt, unabhängig von der Eingabe'
);

select pg_temp.act_as('cccccccc-0000-0000-0000-000000000001');

select ok(
  public.can_read_tenant_content('22222222-2222-2222-2222-222222222222'),
  'Mit laufender Freigabe hat der Plattform-Admin Zugriff auf Inhalte von Beta'
);

-- Widerruf beendet den Zugriff sofort
select pg_temp.act_as('bbbbbbbb-0000-0000-0000-000000000001');
update public.support_grants set revoked_at = now()
  where tenant_id = '22222222-2222-2222-2222-222222222222';

select pg_temp.act_as('cccccccc-0000-0000-0000-000000000001');

select ok(
  not public.can_read_tenant_content('22222222-2222-2222-2222-222222222222'),
  'Nach Widerruf endet der Inhaltszugriff sofort'
);

-- ===========================================================================
-- 8. Gesperrter Betrieb
-- ===========================================================================

select pg_temp.act_as('aaaaaaaa-0000-0000-0000-000000000001');

select ok(
  not public.can_read_tenant_content('33333333-3333-3333-3333-333333333333'),
  'Im gesperrten Betrieb gibt es keinen Zugriff auf Inhalte'
);

select isnt_empty(
  $$select id from public.tenants where id = '33333333-3333-3333-3333-333333333333'$$,
  'Der gesperrte Betrieb bleibt sichtbar, damit die Hinweisseite angezeigt werden kann'
);

select * from finish();

rollback;
