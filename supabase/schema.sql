-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It's safe to run again after it changes; nothing saved is lost.
-- Then add your admin email at the bottom and run that line too.

-- The site's content, as one JSON document (the same shape as `wedding` in app/content.ts).
-- There is only ever one row (id = 1). Until it exists, the site shows app/content.ts.
create table if not exists public.site_content (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Who may sign in to /management and edit the content.
create table if not exists public.admins (
  email text primary key
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

alter table public.site_content enable row level security;
-- No policies on admins: it is only read through is_admin().
alter table public.admins enable row level security;

drop policy if exists "Anyone can read the site content" on public.site_content;
create policy "Anyone can read the site content"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can add the site content" on public.site_content;
create policy "Admins can add the site content"
  on public.site_content for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can change the site content" on public.site_content;
create policy "Admins can change the site content"
  on public.site_content for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
grant execute on function public.is_admin() to authenticated;

-- Replies from the RSVP form. Guests can only add one; admins see them in /management/rsvps.
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  attending boolean not null,
  guests int not null default 0 check (guests between 0 and 10),
  message text not null default '' check (char_length(message) <= 1000),
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;

drop policy if exists "Guests can send an RSVP" on public.rsvps;
create policy "Guests can send an RSVP"
  on public.rsvps for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can read RSVPs" on public.rsvps;
create policy "Admins can read RSVPs"
  on public.rsvps for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can delete RSVPs" on public.rsvps;
create policy "Admins can delete RSVPs"
  on public.rsvps for delete
  to authenticated
  using (public.is_admin());

grant insert on public.rsvps to anon, authenticated;
grant select, delete on public.rsvps to authenticated;

-- Replace with the email of the account you create under Authentication -> Users.
-- insert into public.admins (email) values ('you@example.com');
