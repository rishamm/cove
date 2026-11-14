-- COVE — Supabase schema
-- Run in Supabase: SQL Editor → New query → paste → Run.

-- 1) Admins: only emails listed here can edit content
create table if not exists public.admins (
  email text primary key
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- 2) Site settings: one row holding all text content as JSON
create table if not exists public.settings (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint settings_single_row check (id = 1)
);

-- 3) Projects / photographs
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text default '',
  grp text default '',               -- archive filter key (people, land, objects, abstract…)
  client text default '',
  year int,
  image_url text not null,
  width int,
  height int,
  sort int not null default 0,
  show_hero boolean not null default false,     -- hero collage (first 8)
  show_index boolean not null default true,     -- "Selected work" list
  show_latest boolean not null default false,   -- "The latest" strip
  show_archive boolean not null default true,   -- archive grid
  created_at timestamptz not null default now()
);
create index if not exists projects_sort_idx on public.projects (sort);

-- 4) Row-level security: everyone can read, only admins can write
alter table public.admins   enable row level security;
alter table public.settings enable row level security;
alter table public.projects enable row level security;

drop policy if exists "admins read self"  on public.admins;
create policy "admins read self" on public.admins for select using (public.is_admin());

drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings for select using (true);
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "projects public read" on public.projects;
create policy "projects public read" on public.projects for select using (true);
drop policy if exists "projects admin write" on public.projects;
create policy "projects admin write" on public.projects for all using (public.is_admin()) with check (public.is_admin());

-- 5) Storage bucket for photos (public read, admin write)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

drop policy if exists "photos public read" on storage.objects;
create policy "photos public read" on storage.objects for select using (bucket_id = 'photos');
drop policy if exists "photos admin insert" on storage.objects;
create policy "photos admin insert" on storage.objects for insert with check (bucket_id = 'photos' and public.is_admin());
drop policy if exists "photos admin update" on storage.objects;
create policy "photos admin update" on storage.objects for update using (bucket_id = 'photos' and public.is_admin());
drop policy if exists "photos admin delete" on storage.objects;
create policy "photos admin delete" on storage.objects for delete using (bucket_id = 'photos' and public.is_admin());

-- 6) Make yourself an admin (change the email, then run this line)
-- insert into public.admins (email) values ('you@example.com');
