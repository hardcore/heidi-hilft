-- PROJ-1: Supabase-Infrastruktur & Mandantenfähigkeit
-- Fundament: Betriebe (Mandanten), Profile, Mitgliedschaften, Support-Freigaben, Zugriffsprotokoll
--
-- Grundsatz: Die Mandantentrennung wird in der Datenbank erzwungen (siehe 20261125120100_proj1_rls.sql).
-- Jede künftige Tabelle mit Kundendaten MUSS eine Spalte tenant_id tragen und RLS aktiviert haben.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Aufzählungstypen
-- ---------------------------------------------------------------------------

create type tenant_status as enum ('active', 'suspended');
create type membership_role as enum ('tenant_admin', 'tenant_member');
create type membership_status as enum ('invited', 'active');

-- ---------------------------------------------------------------------------
-- Betriebe (Mandanten) – ein Kunde von AWSMD
-- ---------------------------------------------------------------------------

create table public.tenants (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(trim(name)) between 2 and 120),
  short_name    text not null check (char_length(trim(short_name)) between 1 and 4),
  status        tenant_status not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.tenants is 'Ein Kunde von AWSMD, z. B. eine Fahrschule. Mandanten-Wurzel.';
comment on column public.tenants.short_name is 'Kürzel für die Seitenleiste, z. B. FM für Fahrschule Muster.';

create index tenants_status_idx on public.tenants (status);

-- ---------------------------------------------------------------------------
-- Profile – ein Mensch mit Zugang. id == auth.users.id
-- ---------------------------------------------------------------------------

create table public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              text not null,
  full_name          text,
  is_platform_admin  boolean not null default false,
  last_tenant_id     uuid references public.tenants (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.profiles is 'Nutzerprofil. is_platform_admin ist die AWSMD-Ebene über allen Mandanten.';
comment on column public.profiles.last_tenant_id is 'Zuletzt genutzter Betrieb. Wird serverseitig gesetzt, nie aus dem Browser übernommen.';

create unique index profiles_email_key on public.profiles (lower(email));
create index profiles_platform_admin_idx on public.profiles (is_platform_admin) where is_platform_admin;

-- ---------------------------------------------------------------------------
-- Mitgliedschaften – die eigentliche Berechtigung (Mensch + Betrieb + Rolle)
-- ---------------------------------------------------------------------------

create table public.memberships (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  profile_id     uuid not null references public.profiles (id) on delete cascade,
  role           membership_role not null default 'tenant_member',
  status         membership_status not null default 'invited',
  invited_at     timestamptz not null default now(),
  first_login_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint memberships_unique_per_tenant unique (tenant_id, profile_id)
);

comment on table public.memberships is 'Verbindet Profil und Betrieb mit einer Rolle. Ein Mensch kann in mehreren Betrieben Mitglied sein.';

create index memberships_profile_idx on public.memberships (profile_id);
create index memberships_tenant_idx on public.memberships (tenant_id);
create index memberships_tenant_role_idx on public.memberships (tenant_id, role);

-- Mindestens ein aktiver tenant_admin pro Betrieb.
-- Wird über einen Trigger erzwungen, nicht nur in der Oberfläche (AC: letzter Admin).
create or replace function public.assert_tenant_keeps_admin()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  remaining integer;
begin
  -- Beide Trigger feuern nur, wenn OLD.role = 'tenant_admin' war.
  -- NEW wird hier absichtlich NICHT für die Mandantenkennung gelesen: bei DELETE
  -- ist NEW nicht belegt, und ein Zugriff darauf bricht die Funktion ab.
  select count(*) into remaining
  from public.memberships m
  where m.tenant_id = old.tenant_id
    and m.role = 'tenant_admin'
    and m.id <> old.id;

  if tg_op = 'UPDATE' and new.role = 'tenant_admin' then
    remaining := remaining + 1;
  end if;

  if remaining = 0 then
    raise exception 'Der letzte Kunden-Admin eines Betriebs kann nicht entfernt oder herabgestuft werden'
      using errcode = 'check_violation';
  end if;

  -- Ein BEFORE-DELETE-Trigger muss OLD zurückgeben. NULL würde das Löschen
  -- stillschweigend abbrechen, NEW ist bei DELETE nicht belegt.
  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger memberships_keep_one_admin_on_update
  before update of role on public.memberships
  for each row
  when (old.role = 'tenant_admin' and new.role <> 'tenant_admin')
  execute function public.assert_tenant_keeps_admin();

create trigger memberships_keep_one_admin_on_delete
  before delete on public.memberships
  for each row
  when (old.role = 'tenant_admin')
  execute function public.assert_tenant_keeps_admin();

-- ---------------------------------------------------------------------------
-- Support-Freigaben – die befristete Ausnahme für AWSMD
-- ---------------------------------------------------------------------------

create table public.support_grants (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  granted_by    uuid not null references public.profiles (id) on delete restrict,
  granted_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  revoked_at    timestamptz,
  constraint support_grants_window check (expires_at > granted_at)
);

comment on table public.support_grants is 'Befristeter Inhaltszugriff für AWSMD, freigegeben durch einen tenant_admin. 24 Stunden.';

create index support_grants_tenant_idx on public.support_grants (tenant_id);
-- Höchstens eine offene Freigabe pro Betrieb.
-- Der Index kann now() nicht auswerten (nicht immutable), deshalb greift er auf
-- "nicht widerrufen". Abgelaufene Freigaben werden beim nächsten Freigabeversuch
-- vom Trigger geschlossen (siehe pin_support_grant_window), sonst könnte ein
-- Betrieb nach 24 Stunden nie wieder eine Freigabe erteilen.
create unique index support_grants_one_open_per_tenant
  on public.support_grants (tenant_id)
  where revoked_at is null;

-- ---------------------------------------------------------------------------
-- Zugriffsprotokoll – nur anfügbar. Niemand darf ändern oder löschen, auch AWSMD nicht.
-- ---------------------------------------------------------------------------

create table public.access_log (
  id          bigint generated always as identity primary key,
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  actor_id    uuid references public.profiles (id) on delete set null,
  actor_email text not null,
  as_platform_admin boolean not null default false,
  area        text not null check (char_length(area) between 1 and 80),
  action      text not null check (action in ('view', 'export', 'grant', 'revoke', 'login')),
  occurred_at timestamptz not null default now()
);

comment on table public.access_log is 'Append-only. Dokumentiert Zugriffe von AWSMD auf Kundendaten. Änderung und Löschung sind per RLS verboten.';
comment on column public.access_log.actor_email is 'Festgehalten, damit der Eintrag auch nach Löschung des Profils aussagekräftig bleibt.';

create index access_log_tenant_time_idx on public.access_log (tenant_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- updated_at automatisch pflegen
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger tenants_touch_updated_at before update on public.tenants
  for each row execute function public.touch_updated_at();
create trigger profiles_touch_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger memberships_touch_updated_at before update on public.memberships
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Profil automatisch anlegen, wenn ein auth.users-Eintrag entsteht
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
