-- ─────────────────────────────────────────────────────────────
-- Project store schema. Paste this whole file into
-- Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to run once on a fresh project.
-- ─────────────────────────────────────────────────────────────

-- gen_random_uuid() is built into Postgres 13+ (Supabase), no extension needed.

-- ── Admins ───────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins: read own row" on public.admins;
create policy "admins: read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ── Projects (public catalog) ────────────────────────────────
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title         text not null check (char_length(title) between 2 and 120),
  summary       text not null default '' check (char_length(summary) <= 300),
  description   text not null default '' check (char_length(description) <= 10000),
  category      text not null default 'Web app' check (char_length(category) <= 60),
  tech          text[] not null default '{}',
  cover_url     text,
  demo_url      text,
  monthly_price numeric(10,2) check (monthly_price is null or monthly_price >= 0),
  currency      text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  offers_hosted boolean not null default true,
  offers_setup  boolean not null default true,
  offers_source boolean not null default true,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.projects enable row level security;

drop policy if exists "projects: read published" on public.projects;
create policy "projects: read published" on public.projects
  for select to anon, authenticated using (published or public.is_admin());

drop policy if exists "projects: admin writes" on public.projects;
create policy "projects: admin writes" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Subscriptions (a customer's request / access to one project) ──
do $$ begin
  create type public.sub_status as enum ('pending', 'active', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id  uuid not null references public.projects (id) on delete cascade,
  option      text not null check (option in ('hosted', 'setup', 'source')),
  message     text not null default '' check (char_length(message) <= 2000),
  contact_email text not null default '' check (char_length(contact_email) <= 200),
  contact_phone text not null default '' check (char_length(contact_phone) <= 40),
  status      public.sub_status not null default 'pending',
  admin_note  text not null default '' check (char_length(admin_note) <= 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions (user_id);
create index if not exists subscriptions_project_idx on public.subscriptions (project_id);
alter table public.subscriptions enable row level security;

drop policy if exists "subs: read own or admin" on public.subscriptions;
create policy "subs: read own or admin" on public.subscriptions
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "subs: customer creates pending" on public.subscriptions;
create policy "subs: customer creates pending" on public.subscriptions
  for insert to authenticated with check (
    user_id = auth.uid()
    and status = 'pending'
    and admin_note = ''
    and contact_email = coalesce(auth.jwt() ->> 'email', '')
    and exists (select 1 from public.projects p where p.id = project_id and p.published)
  );

drop policy if exists "subs: admin updates" on public.subscriptions;
create policy "subs: admin updates" on public.subscriptions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "subs: admin deletes" on public.subscriptions;
create policy "subs: admin deletes" on public.subscriptions
  for delete to authenticated using (public.is_admin());

-- ── Private access details (only admins + active subscribers) ──
create table if not exists public.project_access (
  project_id  uuid primary key references public.projects (id) on delete cascade,
  live_url    text,
  source_path text
);
alter table public.project_access enable row level security;

drop policy if exists "access: admin or active subscriber" on public.project_access;
create policy "access: admin or active subscriber" on public.project_access
  for select to authenticated using (
    public.is_admin() or exists (
      select 1 from public.subscriptions s
      where s.project_id = project_access.project_id
        and s.user_id = auth.uid() and s.status = 'active'
    )
  );

drop policy if exists "access: admin writes" on public.project_access;
create policy "access: admin writes" on public.project_access
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Custom project requests (anyone can send, only admins read) ──
create table if not exists public.custom_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid default auth.uid() references auth.users (id) on delete set null,
  name         text not null default '' check (char_length(name) <= 120),
  phone        text not null default '' check (char_length(phone) <= 30),
  email        text not null check (char_length(email) <= 200 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  project_type text not null default '' check (char_length(project_type) <= 60),
  budget       text not null default '' check (char_length(budget) <= 60),
  details      text not null check (char_length(details) between 10 and 5000),
  status       text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at   timestamptz not null default now()
);

-- Migration for databases created before the phone field (safe to re-run).
alter table public.custom_requests add column if not exists phone text not null default '' check (char_length(phone) <= 30);
alter table public.custom_requests drop constraint if exists custom_requests_name_check;
alter table public.custom_requests alter column name set default '';
alter table public.custom_requests add constraint custom_requests_name_check check (char_length(name) <= 120);

alter table public.custom_requests enable row level security;

drop policy if exists "requests: anyone sends" on public.custom_requests;
create policy "requests: anyone sends" on public.custom_requests
  for insert to anon, authenticated with check (status = 'new' and (user_id is null or user_id = auth.uid()));

drop policy if exists "requests: admin reads" on public.custom_requests;
create policy "requests: admin reads" on public.custom_requests
  for select to authenticated using (public.is_admin());

drop policy if exists "requests: admin updates" on public.custom_requests;
create policy "requests: admin updates" on public.custom_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "requests: admin deletes" on public.custom_requests;
create policy "requests: admin deletes" on public.custom_requests
  for delete to authenticated using (public.is_admin());

-- ── updated_at triggers ──────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();
drop trigger if exists subscriptions_touch on public.subscriptions;
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ── Grants (RLS above still decides which rows) ──────────────
grant usage on schema public to anon, authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.subscriptions to authenticated;
grant select, insert, update, delete on public.project_access to authenticated;
grant insert on public.custom_requests to anon, authenticated;
grant select, update, delete on public.custom_requests to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ── Storage buckets ──────────────────────────────────────────
-- covers  = public project images
-- sources = private source-code zips (download only by admins
--           and customers with an ACTIVE "source" subscription)
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true), ('sources', 'sources', false)
on conflict (id) do nothing;

drop policy if exists "covers: admin writes" on storage.objects;
create policy "covers: admin writes" on storage.objects
  for all to authenticated
  using (bucket_id = 'covers' and public.is_admin())
  with check (bucket_id = 'covers' and public.is_admin());

drop policy if exists "sources: admin all" on storage.objects;
create policy "sources: admin all" on storage.objects
  for all to authenticated
  using (bucket_id = 'sources' and public.is_admin())
  with check (bucket_id = 'sources' and public.is_admin());

drop policy if exists "sources: active source subscribers read" on storage.objects;
create policy "sources: active source subscribers read" on storage.objects
  for select to authenticated using (
    bucket_id = 'sources' and exists (
      select 1 from public.project_access pa
      join public.subscriptions s on s.project_id = pa.project_id
      where pa.source_path = storage.objects.name
        and s.user_id = auth.uid()
        and s.status = 'active'
        and s.option = 'source'
    )
  );

-- ── Make yourself admin ──────────────────────────────────────
-- 1. Sign up on your site first.
-- 2. Then run this line with YOUR email:
-- insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';

-- ── Portfolio project details + image bucket (added 2026-11-17) ──
alter table public.projects add column if not exists client      text   not null default '' check (char_length(client) <= 120);
alter table public.projects add column if not exists client_need text   not null default '' check (char_length(client_need) <= 3000);
alter table public.projects add column if not exists delivered   text   not null default '' check (char_length(delivered) <= 3000);
alter table public.projects add column if not exists year        int             check (year between 2000 and 2100);
alter table public.projects add column if not exists gallery     text[] not null default '{}';

-- 3) Public image bucket for project covers and screenshots (10 MB, images only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('projects', 'projects', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
