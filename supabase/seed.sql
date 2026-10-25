-- =====================================================================
-- Contenido de ejemplo (opcional). Ejecutar después de schema.sql.
-- Los platos y precios son de muestra: reemplázalos desde el panel.
-- Las fotos de ejemplo viven en el sitio (public/media/carta); las que se suban desde el panel se guardan en Supabase.
-- =====================================================================

insert into public.site_settings (id, name, description)
values (1, 'Al Aire Gastrobar', E'Cocina de vanguardia para el barrio. La única regla es compartir, disfrutar y crear memoria en cada sabor.\nSan Javier, Comuna 13, Medellín')
on conflict (id) do nothing;

insert into public.links (label, type, url, icon, position) values
  ('Ver la carta',          'menu', null,                                                 'menu',      0),
  ('Reservar por WhatsApp', 'url',  'https://wa.me/573209863732',                         'whatsapp',  1),
  ('Instagram',             'url',  'https://www.instagram.com/alaire.comuna13/',         'instagram', 2),
  ('Cómo llegar',           'url',  'https://maps.google.com/?q=Comuna+13+San+Javier+Medellin', 'map', 3);

with categories as (
  insert into public.menu_categories (name, description, emoji, position, image_url) values
    ('Para compartir',         'Al centro de la mesa, como manda la casa.',   '🫓', 0, 'media/carta/portada-sushi.webp'),
    ('Fuertes',                null,                                          '🔥', 1, 'media/carta/portada-arroz.webp'),
    ('Cócteles de autor',      'Hechos en la barra con frutas de la región.', '🍸', 2, 'media/carta/portada-humo.webp'),
    ('Cervezas y sin alcohol', null,                                          '🍺', 3, 'media/carta/portada-maduro.webp'),
    ('Postres',                null,                                          '🍫', 4, 'media/carta/portada-postre.webp')
  returning id, name
)
insert into public.menu_items (category_id, name, description, price, position, is_available, image_url)
select c.id, i.name, i.description, i.price, i.position, i.is_available, i.image_url
from categories c
join (values
  ('Para compartir',         'Chicharrón al aire',          'Panceta crocante, hogao ahumado y arepa de chócolo.',                  32000, 0, true, 'media/carta/plato-ceviche.webp'),
  ('Para compartir',         'Patacones de la ladera',      'Patacón pisao con guacamole de la casa y suero costeño.',               24000, 1, true, 'media/carta/plato-sushi.webp'),
  ('Para compartir',         'Empanadas de pipián',         'Seis empanadas con ají de lulo.',                                       18000, 2, true, null),
  ('Fuertes',                'Bandeja de vanguardia',       'Frijol cremoso, posta de cerdo glaseada, maduro y huevo de campo.',     42000, 0, true, 'media/carta/plato-pollo.webp'),
  ('Fuertes',                'Pesca del Pacífico',          'Filete del día en leche de coco, arroz con titoté y patacón.',          46000, 1, true, 'media/carta/plato-pollo-pure.webp'),
  ('Fuertes',                'Hamburguesa 13',              'Carne de res madurada, queso costeño a la plancha y cebolla caramelizada.', 38000, 2, false, 'media/carta/plato-arroz.webp'),
  ('Cócteles de autor',      'Grafiti',                     'Ron, maracuyá, jengibre y un toque de chile.',                          30000, 0, true, 'media/carta/plato-humo.webp'),
  ('Cócteles de autor',      'Escaleras',                   'Aguardiente infusionado con mandarina, tónica y romero.',               28000, 1, true, null),
  ('Cócteles de autor',      'Mirador',                     'Ginebra, lulo, albahaca y limón mandarino.',                            32000, 2, true, null),
  ('Cervezas y sin alcohol', 'Cerveza artesanal local',     'Pregunta por la de temporada.',                                         14000, 0, true, null),
  ('Cervezas y sin alcohol', 'Limonada de coco',            'Sin alcohol.',                                                          12000, 1, true, 'media/carta/plato-maduro.webp'),
  ('Postres',                'Brownie de cacao del Urabá',  'Con helado de queso y arequipe.',                                       18000, 0, true, 'media/carta/plato-postre.webp')
) as i (category, name, description, price, position, is_available, image_url) on i.category = c.name;
