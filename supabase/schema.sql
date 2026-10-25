-- =====================================================================
-- Al Aire Gastrobar: estructura de la base de datos.
-- Ejecutar una sola vez en Supabase > SQL Editor > New query > Run.
-- =====================================================================

-- ---------------------------------------------------------------- Tablas

create table if not exists public.site_settings (
  id          int primary key default 1 check (id = 1),  -- una sola fila
  name        text not null,
  description text not null default '',
  avatar_url  text,
  updated_at  timestamptz not null default now()
);

create table if not exists public.links (
  id         uuid primary key default gen_random_uuid(),
  label      text not null check (char_length(label) between 1 and 60),
  type       text not null check (type in ('url', 'menu')),
  url        text,
  icon       text not null default 'link',
  position   int  not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  constraint links_url_required check (type = 'menu' or url is not null)
);

create table if not exists public.menu_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 40),
  description text,
  emoji       text,
  image_url   text,
  position    int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.menu_categories (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 70),
  description  text,
  price        integer not null check (price >= 0),  -- pesos colombianos, sin decimales
  image_url    text,
  position     int  not null default 0,
  is_available boolean not null default true,  -- false = "Agotado"
  is_active    boolean not null default true,  -- false = oculto de la carta
  created_at   timestamptz not null default now()
);
-- Por si la tabla ya existía antes de agregar fotos a las categorías.
alter table public.menu_categories add column if not exists image_url text;

create index if not exists menu_items_category_idx on public.menu_items (category_id);

-- Quiénes pueden editar. Se agregan a mano (ver README).
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- Permisos

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant select on public.site_settings, public.links, public.menu_categories, public.menu_items to anon, authenticated;
grant update on public.site_settings to authenticated;
grant insert, update, delete on public.links, public.menu_categories, public.menu_items to authenticated;
grant select on public.admins to authenticated;

alter table public.site_settings   enable row level security;
alter table public.links           enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items      enable row level security;
alter table public.admins          enable row level security;

-- Lectura: el público ve solo lo visible; el admin ve todo.
create policy "leer perfil" on public.site_settings for select to anon, authenticated using (true);
create policy "leer botones" on public.links for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "leer categorias" on public.menu_categories for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "leer platos" on public.menu_items for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "ver mi rol" on public.admins for select to authenticated using (user_id = (select auth.uid()));

-- Escritura: solo administradores.
create policy "editar perfil" on public.site_settings for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "editar botones" on public.links for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "editar categorias" on public.menu_categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "editar platos" on public.menu_items for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------- Fotos

-- Bucket público para la foto de perfil y las fotos de platos (máx. 5 MB; el panel ya las comprime).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "admin sube fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "admin cambia fotos" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "admin borra fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
