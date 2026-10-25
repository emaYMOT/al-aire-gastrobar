-- =====================================================================
-- Subcategorías de la carta (ej. Bebidas → Sodas, Jugos, Cervezas).
-- Ejecutar en Supabase > SQL Editor > New query > Run. Se puede correr varias veces.
--
-- 1. Crea la tabla de subcategorías y la columna subcategory_id en los platos.
-- 2. Organiza en subcategorías las categorías de la carta real que las tienen.
--    No borra ni cambia platos: solo les asigna su subcategoría (por nombre).
-- =====================================================================

begin;

create table if not exists public.menu_subcategories (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

-- Borrar la subcategoría no borra el plato: queda sin subcategoría.
alter table public.menu_items add column if not exists subcategory_id uuid references public.menu_subcategories (id) on delete set null;

create index if not exists menu_items_subcategory_idx on public.menu_items (subcategory_id);
create index if not exists menu_subcategories_category_idx on public.menu_subcategories (category_id);

grant select on public.menu_subcategories to anon, authenticated;
grant insert, update, delete on public.menu_subcategories to authenticated;
alter table public.menu_subcategories enable row level security;

drop policy if exists "leer subcategorias" on public.menu_subcategories;
create policy "leer subcategorias" on public.menu_subcategories for select to anon, authenticated using (true);
drop policy if exists "editar subcategorias" on public.menu_subcategories;
create policy "editar subcategorias" on public.menu_subcategories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Bebidas: se rehacen sus subcategorías (los platos quedan sin subcategoría un instante y se reasignan).
delete from public.menu_subcategories
where category_id in (select id from public.menu_categories where name = 'Bebidas');

with c as (
  select id from public.menu_categories where name = 'Bebidas' order by position limit 1
),
s as (
  insert into public.menu_subcategories (category_id, name, position)
  select c.id, v.name, v.position
  from c, (values
    ('Sodas', 0),
    ('Jugos y limonadas', 1),
    ('Gaseosas, agua y energizantes', 2),
    ('Cervezas', 3),
    ('Vinos y sangrías', 4)
  ) as v (name, position)
  returning id, category_id, name
)
update public.menu_items i
set subcategory_id = s.id
from s, (values
    ('Sodas', 'Soda de coco'),
    ('Sodas', 'Soda lychee'),
    ('Sodas', 'Soda frutos rojos'),
    ('Sodas', 'Soda frutos amarillos'),
    ('Sodas', 'Soda de sandía'),
    ('Jugos y limonadas', 'Jugo en agua'),
    ('Jugos y limonadas', 'Jugo en leche'),
    ('Jugos y limonadas', 'Limonada de coco'),
    ('Jugos y limonadas', 'Limonada de mango biche'),
    ('Jugos y limonadas', 'Limonada de cereza'),
    ('Jugos y limonadas', 'Limonada natural'),
    ('Gaseosas, agua y energizantes', 'Coca-Cola'),
    ('Gaseosas, agua y energizantes', 'Agua natural'),
    ('Gaseosas, agua y energizantes', 'Agua con gas'),
    ('Gaseosas, agua y energizantes', 'Hatsu'),
    ('Gaseosas, agua y energizantes', 'Red Bull'),
    ('Cervezas', 'Smirnoff'),
    ('Cervezas', 'Cerveza nacional'),
    ('Cervezas', 'Club Colombia Dorada'),
    ('Cervezas', 'Corona'),
    ('Cervezas', 'Stella Artois'),
    ('Vinos y sangrías', 'Sangría frutos rojos'),
    ('Vinos y sangrías', 'Sangría frutos verdes'),
    ('Vinos y sangrías', 'Sangría frutos amarillos'),
    ('Vinos y sangrías', 'Copa de vino'),
    ('Vinos y sangrías', 'Copa de sangría')
) as v (sub, name)
where s.name = v.sub and i.category_id = s.category_id and i.name = v.name;

commit;

-- Que la API vea la tabla nueva de inmediato.
notify pgrst, 'reload schema';

-- Comprobación: cada subcategoría con su número de platos.
select c.name as categoria, s.name as subcategoria, count(i.id) as platos
from public.menu_subcategories s
join public.menu_categories c on c.id = s.category_id
left join public.menu_items i on i.subcategory_id = s.id
group by c.position, c.name, s.position, s.name
order by c.position, s.position;
