-- Run once in Supabase > SQL Editor. Safe to run again.

-- 1) Contact form: phone number, name optional.
alter table public.custom_requests add column if not exists phone text not null default '' check (char_length(phone) <= 30);
alter table public.custom_requests drop constraint if exists custom_requests_name_check;
alter table public.custom_requests alter column name set default '';
alter table public.custom_requests add constraint custom_requests_name_check check (char_length(name) <= 120);

-- 2) Portfolio project details.
alter table public.projects add column if not exists client      text   not null default '' check (char_length(client) <= 120);
alter table public.projects add column if not exists client_need text   not null default '' check (char_length(client_need) <= 3000);
alter table public.projects add column if not exists delivered   text   not null default '' check (char_length(delivered) <= 3000);
alter table public.projects add column if not exists year        int             check (year between 2000 and 2100);
alter table public.projects add column if not exists gallery     text[] not null default '{}';

-- 3) Public image bucket for project covers and screenshots (10 MB, images only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('projects', 'projects', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
