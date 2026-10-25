// Convierte supabase/carta-real.json en:
// - supabase/carta-real.sql: reemplaza toda la carta en Supabase.
// - supabase/subcategorias.sql: agrega las subcategorías a una base que ya tiene la carta (sin borrar nada).
// Uso: node scripts/carta-a-sql.mjs
import { readFile, writeFile } from 'node:fs/promises'

const data = JSON.parse(await readFile(new URL('../supabase/carta-real.json', import.meta.url), 'utf8'))
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replaceAll("'", "''")}'`)

// Una categoría trae "platos" o "subcategorias": [{ nombre, platos }]. Se aplanan en orden.
const platosDe = (cat) => (cat.subcategorias ? cat.subcategorias.flatMap((s) => s.platos.map((p) => [...p, s.nombre])) : cat.platos)

let sql = `-- =====================================================================
-- Carta real de Al Aire Gastrobar (generada desde supabase/carta-real.json).
-- Ejecutar en Supabase > SQL Editor > New query > Run.
--
-- ATENCIÓN: borra TODAS las categorías y platos actuales y los reemplaza
-- por la carta real. Los botones del inicio y el perfil no se tocan.
-- Necesita las subcategorías (schema.sql actualizado o subcategorias.sql).
-- =====================================================================

begin;

delete from public.menu_categories;  -- borra también sus subcategorías y platos (on delete cascade)
`

data.categorias.forEach((cat, ci) => {
  const platos = platosDe(cat)
  const category = `with c as (
  insert into public.menu_categories (name, description, emoji, position)
  values (${q(cat.nombre)}, ${q(cat.descripcion)}, ${q(cat.emoji)}, ${ci})
  returning id
)`
  if (!cat.subcategorias) {
    const rows = platos.map(([name, price, desc], pi) => `    (${q(name)}, ${q(desc)}, ${price}, ${pi})`).join(',\n')
    sql += `
-- ${cat.nombre} (${platos.length})
${category}
insert into public.menu_items (category_id, name, description, price, position)
select c.id, v.name, v.description, v.price, v.position
from c, (values
${rows}
) as v (name, description, price, position);
`
    return
  }
  const subs = cat.subcategorias.map((s, si) => `    (${q(s.nombre)}, ${si})`).join(',\n')
  const rows = platos.map(([name, price, desc, sub], pi) => `    (${q(sub)}, ${q(name)}, ${q(desc)}, ${price}, ${pi})`).join(',\n')
  sql += `
-- ${cat.nombre} (${platos.length}, en ${cat.subcategorias.length} subcategorías)
${category},
s as (
  insert into public.menu_subcategories (category_id, name, position)
  select c.id, v.name, v.position
  from c, (values
${subs}
  ) as v (name, position)
  returning id, name
)
insert into public.menu_items (category_id, subcategory_id, name, description, price, position)
select c.id, s.id, v.name, v.description, v.price, v.position
from c cross join (values
${rows}
) as v (sub, name, description, price, position)
join s on s.name = v.sub;
`
})

sql += `
commit;

-- Comprobación: debe mostrar cada categoría con su número de platos.
select c.position, c.name, count(i.id) as platos
from public.menu_categories c left join public.menu_items i on i.category_id = c.id
group by c.id order by c.position;
`

await writeFile(new URL('../supabase/carta-real.sql', import.meta.url), sql)
const total = data.categorias.reduce((n, c) => n + platosDe(c).length, 0)
console.log(`carta-real.sql: ${data.categorias.length} categorías, ${total} productos`)

// ---------------------------------------------------------------- subcategorias.sql

let migration = `-- =====================================================================
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
`

for (const cat of data.categorias.filter((c) => c.subcategorias)) {
  const subs = cat.subcategorias.map((s, si) => `    (${q(s.nombre)}, ${si})`).join(',\n')
  const rows = cat.subcategorias.flatMap((s) => s.platos.map(([name]) => `    (${q(s.nombre)}, ${q(name)})`)).join(',\n')
  migration += `
-- ${cat.nombre}: se rehacen sus subcategorías (los platos quedan sin subcategoría un instante y se reasignan).
delete from public.menu_subcategories
where category_id in (select id from public.menu_categories where name = ${q(cat.nombre)});

with c as (
  select id from public.menu_categories where name = ${q(cat.nombre)} order by position limit 1
),
s as (
  insert into public.menu_subcategories (category_id, name, position)
  select c.id, v.name, v.position
  from c, (values
${subs}
  ) as v (name, position)
  returning id, category_id, name
)
update public.menu_items i
set subcategory_id = s.id
from s, (values
${rows}
) as v (sub, name)
where s.name = v.sub and i.category_id = s.category_id and i.name = v.name;
`
}

migration += `
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
`

await writeFile(new URL('../supabase/subcategorias.sql', import.meta.url), migration)
console.log(`subcategorias.sql: ${data.categorias.filter((c) => c.subcategorias).map((c) => c.nombre).join(', ')}`)
