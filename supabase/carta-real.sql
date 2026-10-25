-- =====================================================================
-- Carta real de Al Aire Gastrobar (generada desde supabase/carta-real.json).
-- Ejecutar en Supabase > SQL Editor > New query > Run.
--
-- ATENCIÓN: borra TODAS las categorías y platos actuales y los reemplaza
-- por la carta real. Los botones del inicio y el perfil no se tocan.
-- Necesita las subcategorías (schema.sql actualizado o subcategorias.sql).
-- =====================================================================

begin;

delete from public.menu_categories;  -- borra también sus subcategorías y platos (on delete cascade)

-- Entradas (11)
with c as (
  insert into public.menu_categories (name, description, emoji, position)
  values ('Entradas', null, '🥗', 0)
  returning id
)
insert into public.menu_items (category_id, name, description, price, position)
select c.id, v.name, v.description, v.price, v.position
from c, (values
    ('Carpaccio de pera y salmón ahumado', 'Experiencia en mesa. Lonjas de pera marinada con duraznos y salmón ahumado acompañado de queso azul, nueces, tomates perla, pistacho y un toque cítrico con miel de yuzu. “Un plato fresco, elegante y con muchos matices de sabor”.', 26900, 0),
    ('Taco maré del Pacífico', 'Nuestro coctel de camarones servido en taco nori crujiente con terrificación de plátano, una mezcla de aguacate y salsa cítrica de la casa. “Un sabor que evoca la marea fresca, vibrante y con carácter”.', 35900, 1),
    ('Ceviche de pesca blanca', 'Pesca fresca blanca servida con nuestra leche de tigre de coco ahumado, acompañada de camote, vegetales frescos y maíz crocante con notas tostadas. “Una mezcla equilibrada, profunda y llena de contraste”.', 30900, 2),
    ('Cítrico de chicharrón', 'Nuestra versión crocante isleña, cremosa y ácida del ceviche de chicharrón, servido con suero, mermelada de ají limo peruano, aguacate y crocantes de plátano. “Un sabor intenso, inesperado y absolutamente adictivo”.', 26900, 3),
    ('Roll crunch de pollo dorado', 'Dos bocados de pollo crujiente relleno de mango marinado en osmosis de ron, gel de coco, acompañado de una salsa chutney aromatizada con especias y profundidad de Medio Oriente. “Un contraste de sabor, color y aromas intensos”.', 28900, 4),
    ('Ritual de ahumado y res', 'Experiencia en mesa. Ceviche de solomito seleccionado de res, marinado en pimientos ahumados, con notas cítricas, servido con croqueta de arroz cremoso de quesos madurados, salsa de ajo, miel y cilantro y cebolla crispy caramelizada con nuestra salsa teriyaki, ahumado en bruma de roble.', 37900, 5),
    ('Conos crispy de atún', 'Experiencia en mesa. Tartar de atún tuna seleccionado, servido en cucuruchos crujientes, acompañados de salsa de aguacate y miel con notas de mango, maracuyá y siracha. “Una mezcla de sabores y texturas frescas, suaves y tropicales”.', 34900, 6),
    ('Glaseado de pera y queso brie', 'Experiencia en mesa. Pera glaseada al horno, rellena de queso maduro, arándanos y nueces, queso brie fundido con caramelo de romero y jarabe. “Una experiencia delicada, melosa, fresca y ahumada en frío”.', 26900, 7),
    ('Croquetas del Mediterráneo', 'Tres bocados crujientes de res y vegetales que contrastan con la suavidad de una espuma de queso parmesano, aderezo de ajo, reducción de balsámico de moras y tomates perla marinados.', 22900, 8),
    ('Marranitas', 'Cuatro bocados crujientes de plátano maduro y chicharrón que contrastan con la suavidad de una espuma de suero. “Una combinación entre lo dulce y lo salado”.', 22900, 9),
    ('Lluvia de nachos', 'Una explosión de sabores: nachos crujientes cubiertos con res desmechada, guacamole artesanal, sour cream, salsa cheddar, queso parmesano y piña dulce a la parrilla. Ideal para compartir.', 25000, 10)
) as v (name, description, price, position);

-- Platos fuertes (17)
with c as (
  insert into public.menu_categories (name, description, emoji, position)
  values ('Platos fuertes', null, '🔥', 1)
  returning id
)
insert into public.menu_items (category_id, name, description, price, position)
select c.id, v.name, v.description, v.price, v.position
from c, (values
    ('Glasé de pollo', 'Pechuga glaseada al horno con maple de arándanos y reducción balsámica, servida con puré nativo de batata ahumada, vegetales grillados en finas hierbas y pistacho. “Un plato meloso, jugoso y con una intensidad de sabor”.', 45900, 0),
    ('Solomito de cerdo con aire de lima', 'Medallones de solomito de cerdo en costra de hierbas, servido con duquesa de papa rellena de vegetales asados con aderezo de albahaca, salsa de moras y aire de lima cítrico. Contraste de sabores ácidos frescos y texturas suaves.', 42900, 1),
    ('Lomito de res trufado', 'Solomito de res asado en costra de hierbas, bañado en salsa de hongos silvestres trufados, arroz cremoso verde aromatizado con cerveza y nueces, servido con bouquet de tierra de verduras, tomates perla y mézclum de lechugas. “Muy aromático, al punto y de sabores potentes”.', 58900, 2),
    ('Solomito de res napado', 'Medallón de res servido con salsa de vino tinto sobre puré cremoso de papa trufado con tomates secos, acompañado de vegetales a la parrilla y espuma de queso parmesano. Suave, cremoso, con contrastes intensos de sabor.', 58900, 3),
    ('Pollo romesco', 'Pechuga de pollo grillé, servida con arroz cremoso de coco, ensalada fresca de temporada con frutas glaseadas en reducción balsámica y salsa romesco de tomates secos y pimientos.', 44900, 4),
    ('Costillas flambeadas', 'Costillas de cerdo en cocción lenta con nuestra BBQ de lulo Jack Daniel''s, flambeadas en mesa y servidas con ensalada fresca de temporada y papas crocantes con polvo de pimientos, perejil y ajo asado. “Jugosidad e intensidad de sabor con notas tropicales y fuego intenso”.', 62900, 5),
    ('Risotto de mar y tierra', 'Risotto cremoso aromatizado con vino de la casa, servido con una mezcla de camarones y puntas de solomito de res, con toques de almendra y reducción balsámica. “Una mezcla envolvente, suave y con equilibrio entre lo tostado y lo profundo”.', 54900, 6),
    ('Meloso de origen', 'Arroz meloso costero del Mediterráneo perfumado con cerveza rubia, salsa de pimientos y tomates secos, servido con langostinos grillados, puntas de solomito de res y coronado con ensalada acevichada con aguacate ahumado y tomates perla. “Sabores potentes, texturas melosas y ácido envolvente”.', 47900, 7),
    ('Travesía del muelle', 'Langostinos asados al punto sobre crema de ají amarillo perfumada con notas de pisco, puré de papa guarnecido con ensalada cítrica, aguacate, tomates perla, mézclum, aire de limón y terrificación de arvejas frescas. “Un plato que contrasta sabores intensos y texturas del mar”.', 39900, 8),
    ('Bajo la campana', 'Experiencia en mesa. Fetuccini mar y tierra con camarones y solomito salteado en finas hierbas, crema de ají panca y tomates secos, servido con calabacines asados y champiñones, con notas de pimientos ahumados en roble. “Un plato envolvente, cremoso y con experiencia aromática”.', 48900, 9),
    ('Chancho del Cusco', 'Tocino de cerdo asado en cocción lenta con notas de ají limo y panca, acompañado de un ceviche de mango, puré de papa ahumado y aire cítrico de limón mandarino achotado. Crujiente y en balance entre lo graso, lo cítrico y lo cálido.', 47900, 10),
    ('Tacos de cochinillo', 'Cochinita pibil jugosa servida con vegetales acevichados, crema de aguacate ahumado y mermelada de ají amarillo con mango marinado en ron Jamaica.', 35900, 11),
    ('Salmón en osmosis', 'Filete de salmón fresco asado al punto, servido sobre espejo cítrico de naranja, falso caviar de mora, arroz cremoso de hongos y ensalada fresca de temporada. “Una experiencia de sabor y color mediante la osmosis de mora y vino tinto”.', 68900, 12),
    ('Tataki de atún encostrado', 'Filete de atún tuna encostrado en sésamo negro y blanco, aromatizado con finas hierbas, servido sobre salsa cremosa de vino blanco marmoleado, vegetales glaseados y crocantes de arroz con reducción balsámica. “Delicado e intenso en sabor”.', 60900, 13),
    ('Pollo Pirés Jerk', 'Pechuga de pollo en una mezcla de especias aromáticas con ron de coco, servida con ensalada fresca de temporada y papas crocantes con polvo de pimientos, perejil y ajo asado. Sabores tropicales, frescos y nativos.', 46900, 14),
    ('Menú infantil', 'A elegir: 5 bastones de pollo acompañados de papas crocantes en espiral, o 3 croquetas de res acompañadas de papas crocantes en espiral.', 25000, 15),
    ('Trío de mini burgers', 'Tres mini hamburguesas que lo tienen todo: carne de res de la casa, pan artesanal, mozzarella fundida, cebolla caramelizada, lechuga fresca y nuestro irresistible dip de tocineta. Servidas con una generosa porción de papas a la francesa. ¡Perfectas para compartir… o no!', 40000, 16)
) as v (name, description, price, position);

-- Rollos de sushi (4)
with c as (
  insert into public.menu_categories (name, description, emoji, position)
  values ('Rollos de sushi', null, '🍣', 2)
  returning id
)
insert into public.menu_items (category_id, name, description, price, position)
select c.id, v.name, v.description, v.price, v.position
from c, (values
    ('Bocados asiáticos', 'Arroz de sushi al punto coronado con kanikama de cangrejo y salsa dinamita de la casa, falso caviar de yuzu y crema de aguacate. 4 bocados.', 23900, 0),
    ('Spicy tuna roll', 'Elaborado con arroz premium, puerro crocante, pepino y mango, con cubierta de aguacate y atún tuna, notas de ají amarillo y sésamo negro; se acompaña con aderezo de la casa.', 39900, 1),
    ('Salmón nutty roll', 'Elaborado con arroz invertido, relleno de salmón fresco marinado, pepino y aderezo teriyaki, cubierto de kanikama, dinamita y almendras tostadas con mayonesa de maracuyá.', 43900, 2),
    ('Nigiris', 'Bocados de arroz con salmón y atún servidos con mayonesa teriyaki y aderezo de aguacate con salsa de la casa. 4 bocados.', 19900, 3)
) as v (name, description, price, position);

-- Bebidas (26, en 5 subcategorías)
with c as (
  insert into public.menu_categories (name, description, emoji, position)
  values ('Bebidas', 'Sodas, jugos, limonadas, cervezas y sangría.', '🥤', 3)
  returning id
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
  returning id, name
)
insert into public.menu_items (category_id, subcategory_id, name, description, price, position)
select c.id, s.id, v.name, v.description, v.price, v.position
from c cross join (values
    ('Sodas', 'Soda de coco', null, 16000, 0),
    ('Sodas', 'Soda lychee', null, 16000, 1),
    ('Sodas', 'Soda frutos rojos', null, 16000, 2),
    ('Sodas', 'Soda frutos amarillos', null, 16000, 3),
    ('Sodas', 'Soda de sandía', null, 16000, 4),
    ('Jugos y limonadas', 'Jugo en agua', null, 9000, 5),
    ('Jugos y limonadas', 'Jugo en leche', null, 10000, 6),
    ('Jugos y limonadas', 'Limonada de coco', null, 14000, 7),
    ('Jugos y limonadas', 'Limonada de mango biche', null, 14000, 8),
    ('Jugos y limonadas', 'Limonada de cereza', null, 14000, 9),
    ('Jugos y limonadas', 'Limonada natural', null, 12000, 10),
    ('Gaseosas, agua y energizantes', 'Coca-Cola', null, 8000, 11),
    ('Gaseosas, agua y energizantes', 'Agua natural', null, 7000, 12),
    ('Gaseosas, agua y energizantes', 'Agua con gas', null, 7000, 13),
    ('Gaseosas, agua y energizantes', 'Hatsu', null, 10000, 14),
    ('Gaseosas, agua y energizantes', 'Red Bull', null, 12000, 15),
    ('Cervezas', 'Smirnoff', null, 14000, 16),
    ('Cervezas', 'Cerveza nacional', null, 9000, 17),
    ('Cervezas', 'Club Colombia Dorada', null, 10000, 18),
    ('Cervezas', 'Corona', null, 12000, 19),
    ('Cervezas', 'Stella Artois', null, 12000, 20),
    ('Vinos y sangrías', 'Sangría frutos rojos', null, 130000, 21),
    ('Vinos y sangrías', 'Sangría frutos verdes', null, 130000, 22),
    ('Vinos y sangrías', 'Sangría frutos amarillos', null, 130000, 23),
    ('Vinos y sangrías', 'Copa de vino', null, 18000, 24),
    ('Vinos y sangrías', 'Copa de sangría', null, 20000, 25)
) as v (sub, name, description, price, position)
join s on s.name = v.sub;

-- Postre (1)
with c as (
  insert into public.menu_categories (name, description, emoji, position)
  values ('Postre', null, '🍫', 4)
  returning id
)
insert into public.menu_items (category_id, name, description, price, position)
select c.id, v.name, v.description, v.price, v.position
from c, (values
    ('Tentación', 'Brownie con un espejo de tres leches, bañado en Milo, acompañado de helado de vainilla y salsa de caramelo salado.', 25900, 0)
) as v (name, description, price, position);

-- Coctelería de autor (9)
with c as (
  insert into public.menu_categories (name, description, emoji, position)
  values ('Coctelería de autor', null, '🍸', 5)
  returning id
)
insert into public.menu_items (category_id, name, description, price, position)
select c.id, v.name, v.description, v.price, v.position
from c, (values
    ('Al Aire', 'Ginebra y notas cítricas de limón y triple sec, equilibradas con un sutil toque dulce y un ligero picante. Coronado con espuma cítrica y terminado con ahumado en mesa que intensifica sus aromas. Fresco, aromático y con carácter.', 35000, 0),
    ('Cromático', 'Vodka con puré de lichi y frutos rojos, equilibrado con limón y tónica de rosas. Acompañado de caviar de frutos rojos y pétalos nitrogenados que aportan un toque visual y sensorial único. Refrescante, floral y sorprendente.', 38000, 1),
    ('Roble de otoño', 'Whisky con notas de manzana y vermut seco, realzado con un toque de angostura. Se presenta con manzana fresca caramelizada en mesa, liberando aromas dulces y especiados. Elegante, cálido y envolvente.', 38000, 2),
    ('Malibu matcha', 'Ron blanco y coco con piña y jengibre, fusionados con un toque de matcha. Acompañado de helado nitrogenado preparado en mesa con notas de coco y lichi. Exótico, cremoso y refrescante.', 40000, 3),
    ('Rojo ancestral', 'Aguardiente con limón y sirope de panela, combinado en textura frappé y realzado con un toque de angostura. Servido sobre puré de frutos rojos, decorado con brocheta frutal. Refrescante, frutal y con esencia tradicional.', 40000, 4),
    ('Cosmic glow', 'Ron y aguardiente con frutas amarillas y limón, equilibrados y refrescantes. Finalizado con un toque de curaçao azul y aromatizado con spray cítrico en mesa. Vibrante, aromático y cautivador.', 38000, 5),
    ('Magic air', 'Aguardiente y vodka con notas de piña, jengibre y betabel morado. Se transforma con gotas cítricas y se finaliza con un toque ahumado de romero en mesa. Intenso, aromático y sorprendente.', 38000, 6),
    ('Golden pasión', 'Ginebra y prosecco con maracuyá, limón y albahaca, en doble colado para una textura suave. Finalizado con tónica de enebro y flor de saúco, en una presentación aromática. Refrescante, floral y con una sorpresa de fuego asiático elegante en mesa.', 38000, 7),
    ('Don Ramón', 'Tequila y triple sec con limón y chile guajillo, balanceados con frutas amarillas. Copa con sal de flor de jamaica e hielo con ají pajarito, terminado con un flambeado en mesa con tequila reposado. Poco picante, cítrico y visual.', 38000, 8)
) as v (name, description, price, position);

-- Coctelería clásica (17)
with c as (
  insert into public.menu_categories (name, description, emoji, position)
  values ('Coctelería clásica', null, '🍹', 6)
  returning id
)
insert into public.menu_items (category_id, name, description, price, position)
select c.id, v.name, v.description, v.price, v.position
from c, (values
    ('Moscow Mule', null, 35000, 0),
    ('Aperol Spritz', null, 30000, 1),
    ('Mojito', null, 28000, 2),
    ('Margarita', null, 38000, 3),
    ('Daiquirí', null, 32000, 4),
    ('Whiskey Sour', null, 36000, 5),
    ('Pisco Sour', null, 38000, 6),
    ('Negroni', null, 38000, 7),
    ('Old Fashioned', null, 32000, 8),
    ('Caipiroska', null, 32000, 9),
    ('Cuba Libre', null, 28000, 10),
    ('Long Island', null, 40000, 11),
    ('Paloma', null, 38000, 12),
    ('Gin Tonic', null, 35000, 13),
    ('Espresso Martini', null, 32000, 14),
    ('Dry Martini', null, 30000, 15),
    ('Cosmopolitan', null, 34000, 16)
) as v (name, description, price, position);

commit;

-- Comprobación: debe mostrar cada categoría con su número de platos.
select c.position, c.name, count(i.id) as platos
from public.menu_categories c left join public.menu_items i on i.category_id = c.id
group by c.id order by c.position;
