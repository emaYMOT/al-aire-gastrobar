import type { Category, LinkButton, MenuItem, SiteSettings, Subcategory } from './types'

// Contenido de ejemplo. Es el mismo que supabase/seed.sql.
// Las fotos (public/media/carta) salen de un video del restaurante; los nombres no coinciden, son de demostración.
// Los precios y platos son de muestra: el restaurante los reemplaza desde el panel.

export const seedSettings: SiteSettings = {
  name: 'Al Aire Gastrobar',
  description: 'Cocina de vanguardia para el barrio. La única regla es compartir, disfrutar y crear memoria en cada sabor.\nSan Javier, Comuna 13, Medellín',
  avatar_url: null,
}

export const seedLinks: LinkButton[] = [
  { id: 'l1', label: 'Ver la carta', type: 'menu', url: null, icon: 'menu', position: 0, is_active: true },
  { id: 'l2', label: 'Reservar por WhatsApp', type: 'url', url: 'https://wa.me/573209863732', icon: 'whatsapp', position: 1, is_active: true },
  { id: 'l3', label: 'Instagram', type: 'url', url: 'https://www.instagram.com/alaire.comuna13/', icon: 'instagram', position: 2, is_active: true },
  { id: 'l4', label: 'Cómo llegar', type: 'url', url: 'https://maps.google.com/?q=Comuna+13+San+Javier+Medellin', icon: 'map', position: 3, is_active: true },
]

export const seedCategories: Category[] = [
  { id: 'c1', name: 'Para compartir', description: 'Al centro de la mesa, como manda la casa.', image_url: 'media/carta/portada-sushi.webp', emoji: '🫓', position: 0, is_active: true },
  { id: 'c2', name: 'Fuertes', description: null, image_url: 'media/carta/portada-arroz.webp', emoji: '🔥', position: 1, is_active: true },
  { id: 'c3', name: 'Cócteles de autor', description: 'Hechos en la barra con frutas de la región.', image_url: 'media/carta/portada-humo.webp', emoji: '🍸', position: 2, is_active: true },
  { id: 'c4', name: 'Bebidas', description: null, image_url: 'media/carta/portada-maduro.webp', emoji: '🍺', position: 3, is_active: true },
  { id: 'c5', name: 'Postres', description: null, image_url: 'media/carta/portada-postre.webp', emoji: '🍫', position: 4, is_active: true },
]

export const seedSubcategories: Subcategory[] = [
  { id: 's1', category_id: 'c4', name: 'Cervezas', position: 0 },
  { id: 's2', category_id: 'c4', name: 'Sin alcohol', position: 1 },
]

const item = (id: string, category_id: string, position: number, name: string, description: string, price: number, extra: Partial<MenuItem> = {}): MenuItem => ({
  id, category_id, subcategory_id: null, position, name, description, price, image_url: null, is_available: true, is_active: true, ...extra,
})

export const seedItems: MenuItem[] = [
  item('i1', 'c1', 0, 'Chicharrón al aire', 'Panceta crocante, hogao ahumado y arepa de chócolo.', 32000, { image_url: 'media/carta/plato-ceviche.webp' }),
  item('i2', 'c1', 1, 'Patacones de la ladera', 'Patacón pisao con guacamole de la casa y suero costeño.', 24000, { image_url: 'media/carta/plato-sushi.webp' }),
  item('i3', 'c1', 2, 'Empanadas de pipián', 'Seis empanadas con ají de lulo.', 18000),
  item('i4', 'c2', 0, 'Bandeja de vanguardia', 'Frijol cremoso, posta de cerdo glaseada, maduro y huevo de campo.', 42000, { image_url: 'media/carta/plato-pollo.webp' }),
  item('i5', 'c2', 1, 'Pesca del Pacífico', 'Filete del día en leche de coco, arroz con titoté y patacón.', 46000, { image_url: 'media/carta/plato-pollo-pure.webp' }),
  item('i6', 'c2', 2, 'Hamburguesa 13', 'Carne de res madurada, queso costeño a la plancha y cebolla caramelizada.', 38000, { image_url: 'media/carta/plato-arroz.webp', is_available: false }),
  item('i7', 'c3', 0, 'Grafiti', 'Ron, maracuyá, jengibre y un toque de chile.', 30000, { image_url: 'media/carta/plato-humo.webp' }),
  item('i8', 'c3', 1, 'Escaleras', 'Aguardiente infusionado con mandarina, tónica y romero.', 28000),
  item('i9', 'c3', 2, 'Mirador', 'Ginebra, lulo, albahaca y limón mandarino.', 32000),
  item('i10', 'c4', 0, 'Cerveza artesanal local', 'Pregunta por la de temporada.', 14000, { subcategory_id: 's1' }),
  item('i13', 'c4', 1, 'Club Colombia Dorada', '', 10000, { subcategory_id: 's1' }),
  item('i11', 'c4', 0, 'Limonada de coco', '', 12000, { subcategory_id: 's2', image_url: 'media/carta/plato-maduro.webp' }),
  item('i14', 'c4', 1, 'Soda de frutos rojos', 'Frutos rojos, limón y soda.', 16000, { subcategory_id: 's2' }),
  item('i12', 'c5', 0, 'Brownie de cacao del Urabá', 'Con helado de queso y arequipe.', 18000, { image_url: 'media/carta/plato-postre.webp' }),
]
