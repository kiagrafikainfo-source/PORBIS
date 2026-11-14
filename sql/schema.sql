-- PORTAL BERITA SEKOLAH - Supabase PostgreSQL
-- Jalankan seluruh script ini di Supabase Dashboard > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'petugas' check (role in ('admin','petugas')),
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title varchar(180) not null,
  category varchar(60) not null,
  image_url text,
  summary varchar(300) not null,
  content text not null,
  is_published boolean not null default false,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title varchar(180) not null,
  content text not null,
  event_date date,
  is_active boolean not null default true,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_published_created_idx on public.news(is_published, created_at desc);
create index if not exists news_category_idx on public.news(category);
create index if not exists announcements_active_created_idx on public.announcements(is_active, created_at desc);

-- Profil otomatis dibuat setelah user baru mendaftar melalui Supabase Auth.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'petugas')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- updated_at otomatis berubah saat data diperbarui.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists news_updated_at on public.news;
create trigger news_updated_at before update on public.news for each row execute procedure public.set_updated_at();
drop trigger if exists announcements_updated_at on public.announcements;
create trigger announcements_updated_at before update on public.announcements for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.news enable row level security;
alter table public.announcements enable row level security;

-- Fungsi pemeriksa role untuk policy.
create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

-- Profil hanya dapat dibaca pemiliknya atau admin; user tidak boleh mengubah role sendiri.
drop policy if exists "profile read own or admin" on public.profiles;
create policy "profile read own or admin" on public.profiles for select to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');
drop policy if exists "profile update own name" on public.profiles;
create policy "profile update own name" on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

-- Pengunjung umum hanya melihat konten yang sudah dipublikasikan.
drop policy if exists "public read published news" on public.news;
create policy "public read published news" on public.news for select to anon, authenticated
using (is_published = true or (auth.uid() is not null and public.current_user_role() in ('admin','petugas')));
drop policy if exists "staff insert news" on public.news;
create policy "staff insert news" on public.news for insert to authenticated
with check (public.current_user_role() in ('admin','petugas') and author_id = auth.uid());
drop policy if exists "staff update news" on public.news;
create policy "staff update news" on public.news for update to authenticated
using (public.current_user_role() in ('admin','petugas'))
with check (public.current_user_role() in ('admin','petugas'));
drop policy if exists "admin delete news" on public.news;
create policy "admin delete news" on public.news for delete to authenticated
using (public.current_user_role() = 'admin');

drop policy if exists "public read active announcements" on public.announcements;
create policy "public read active announcements" on public.announcements for select to anon, authenticated
using (is_active = true or (auth.uid() is not null and public.current_user_role() in ('admin','petugas')));
drop policy if exists "staff insert announcements" on public.announcements;
create policy "staff insert announcements" on public.announcements for insert to authenticated
with check (public.current_user_role() in ('admin','petugas') and author_id = auth.uid());
drop policy if exists "staff update announcements" on public.announcements;
create policy "staff update announcements" on public.announcements for update to authenticated
using (public.current_user_role() in ('admin','petugas'))
with check (public.current_user_role() in ('admin','petugas'));
drop policy if exists "admin delete announcements" on public.announcements;
create policy "admin delete announcements" on public.announcements for delete to authenticated
using (public.current_user_role() = 'admin');

-- Setelah membuat user melalui Authentication > Users, jadikan user pertama sebagai admin:
-- UPDATE public.profiles SET role = 'admin', full_name = 'Administrator Sekolah'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'user@kantor.com');
