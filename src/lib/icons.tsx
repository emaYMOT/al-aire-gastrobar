import type { ReactElement, SVGProps } from 'react'
import {
  Award, Baby, Beef, Beer, Bike, BookOpen, Briefcase, CakeSlice, CalendarDays, Camera, Car, ChefHat, Clock, Coffee, CreditCard,
  Croissant, Drumstick, Dumbbell, FileText, Fish, Flame, Gamepad2, Gem, Gift, Globe, HandPlatter, Headphones, Heart, IceCreamCone,
  Info, Leaf, Link, Mail, MapPin, Martini, Megaphone, MessageCircle, Navigation, Newspaper, Package, PartyPopper, PawPrint, Percent,
  Phone, Pizza, Salad, Sandwich, Scissors, Shirt, ShoppingBag, ShoppingCart, Smartphone, Soup, Sparkles, Star, Store, Tag,
  ThumbsUp, Ticket, Truck, Users, UtensilsCrossed, Video, Wifi, Wine, type LucideIcon,
} from 'lucide-react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

// Íconos de redes dibujados con el mismo trazo que lucide (que no trae logos de marcas).
const stroke = (size = 24, props: IconProps) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

const Instagram = ({ size, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
)

const WhatsApp = ({ size, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
    <path d="M9 8.6c0 3 2.4 6.4 6 6.4l1-1.5-2-1-1 .8c-1-.5-2-1.5-2.4-2.4l.8-1-1-2z" />
  </svg>
)

const TikTok = ({ size, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 3c.4 2.6 2.3 4.4 5 4.6" />
  </svg>
)

const Facebook = ({ size, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V21" />
    <path d="M6 11h8" />
  </svg>
)

const YouTube = ({ size, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="M10.5 9.5v5l4-2.5z" fill="currentColor" />
  </svg>
)

const X = ({ size, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>
)

const Telegram = ({ size, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <path d="M21 4L3 11l6 2.5L19 7l-8 8 6.5 5z" />
  </svg>
)

const LinkedIn = ({ size, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 10.5V16M8 7.5v.01M12 16v-5.5M12 13a2.5 2.5 0 0 1 5 0v3" />
  </svg>
)

const fromLucide = (Icon: LucideIcon) => ({ size, ...p }: IconProps) => <Icon size={size} strokeWidth={2} aria-hidden {...(p as object)} />

type Grupo = 'Carta y tienda' | 'Redes' | 'Contacto y ubicación' | 'Comida y bebida' | 'Negocio'
const icon = (label: string, grupo: Grupo, Icon: (p: IconProps) => ReactElement) => ({ label, grupo, Icon })
const lu = (label: string, grupo: Grupo, Icon: LucideIcon) => icon(label, grupo, fromLucide(Icon))

export const GRUPOS_ICONOS: Grupo[] = ['Carta y tienda', 'Redes', 'Contacto y ubicación', 'Comida y bebida', 'Negocio']

export const ICONS = {
  // Carta y tienda
  menu: lu('Carta', 'Carta y tienda', UtensilsCrossed),
  shop: lu('Tienda', 'Carta y tienda', ShoppingBag),
  cart: lu('Pedido', 'Carta y tienda', ShoppingCart),
  chef: lu('Menú del día', 'Carta y tienda', ChefHat),
  platter: lu('Servicio', 'Carta y tienda', HandPlatter),
  pdf: lu('Menú en PDF', 'Carta y tienda', FileText),
  package: lu('Productos', 'Carta y tienda', Package),
  tag: lu('Precios', 'Carta y tienda', Tag),
  percent: lu('Descuentos', 'Carta y tienda', Percent),
  gift: lu('Promos', 'Carta y tienda', Gift),
  // Redes
  whatsapp: icon('WhatsApp', 'Redes', WhatsApp),
  instagram: icon('Instagram', 'Redes', Instagram),
  tiktok: icon('TikTok', 'Redes', TikTok),
  facebook: icon('Facebook', 'Redes', Facebook),
  youtube: icon('YouTube', 'Redes', YouTube),
  x: icon('X (Twitter)', 'Redes', X),
  telegram: icon('Telegram', 'Redes', Telegram),
  linkedin: icon('LinkedIn', 'Redes', LinkedIn),
  video: lu('Video', 'Redes', Video),
  camera: lu('Fotos', 'Redes', Camera),
  // Contacto y ubicación
  phone: lu('Teléfono', 'Contacto y ubicación', Phone),
  smartphone: lu('Celular', 'Contacto y ubicación', Smartphone),
  chat: lu('Chat', 'Contacto y ubicación', MessageCircle),
  mail: lu('Correo', 'Contacto y ubicación', Mail),
  map: lu('Ubicación', 'Contacto y ubicación', MapPin),
  navigation: lu('Cómo llegar', 'Contacto y ubicación', Navigation),
  delivery: lu('Domicilios', 'Contacto y ubicación', Bike),
  truck: lu('Envíos', 'Contacto y ubicación', Truck),
  car: lu('Parqueadero', 'Contacto y ubicación', Car),
  clock: lu('Horarios', 'Contacto y ubicación', Clock),
  web: lu('Web', 'Contacto y ubicación', Globe),
  link: lu('Enlace', 'Contacto y ubicación', Link),
  // Comida y bebida
  pizza: lu('Pizza', 'Comida y bebida', Pizza),
  burger: lu('Sándwich', 'Comida y bebida', Sandwich),
  beef: lu('Carnes', 'Comida y bebida', Beef),
  chicken: lu('Pollo', 'Comida y bebida', Drumstick),
  fish: lu('Pescados', 'Comida y bebida', Fish),
  soup: lu('Sopas', 'Comida y bebida', Soup),
  salad: lu('Ensaladas', 'Comida y bebida', Salad),
  bakery: lu('Panadería', 'Comida y bebida', Croissant),
  cake: lu('Postres', 'Comida y bebida', CakeSlice),
  icecream: lu('Helados', 'Comida y bebida', IceCreamCone),
  coffee: lu('Café', 'Comida y bebida', Coffee),
  cocktail: lu('Cocteles', 'Comida y bebida', Martini),
  wine: lu('Vinos', 'Comida y bebida', Wine),
  beer: lu('Cervezas', 'Comida y bebida', Beer),
  fire: lu('A la parrilla', 'Comida y bebida', Flame),
  vegan: lu('Vegano', 'Comida y bebida', Leaf),
  // Negocio
  calendar: lu('Reservas', 'Negocio', CalendarDays),
  ticket: lu('Eventos', 'Negocio', Ticket),
  party: lu('Celebraciones', 'Negocio', PartyPopper),
  users: lu('Grupos', 'Negocio', Users),
  star: lu('Reseñas', 'Negocio', Star),
  thumbs: lu('Recomendaciones', 'Negocio', ThumbsUp),
  award: lu('Premios', 'Negocio', Award),
  heart: lu('Favoritos', 'Negocio', Heart),
  sparkles: lu('Novedades', 'Negocio', Sparkles),
  megaphone: lu('Anuncios', 'Negocio', Megaphone),
  news: lu('Noticias', 'Negocio', Newspaper),
  book: lu('Historia', 'Negocio', BookOpen),
  info: lu('Información', 'Negocio', Info),
  card: lu('Pagos', 'Negocio', CreditCard),
  wifi: lu('Wifi', 'Negocio', Wifi),
  music: lu('Música', 'Negocio', Headphones),
  games: lu('Juegos', 'Negocio', Gamepad2),
  job: lu('Trabaja con nosotros', 'Negocio', Briefcase),
  store: lu('Local', 'Negocio', Store),
  kids: lu('Niños', 'Negocio', Baby),
  pets: lu('Mascotas', 'Negocio', PawPrint),
  gym: lu('Gimnasio', 'Negocio', Dumbbell),
  beauty: lu('Belleza', 'Negocio', Scissors),
  clothes: lu('Ropa', 'Negocio', Shirt),
  jewel: lu('Joyas', 'Negocio', Gem),
} as const

export type IconKey = keyof typeof ICONS

export function LinkIcon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const entry = ICONS[name as IconKey] ?? ICONS.link
  return <entry.Icon size={size} className={className} />
}

/** Sugiere un ícono a partir de la URL que escribe el admin. */
export function guessIcon(url: string): IconKey | null {
  const u = url.toLowerCase()
  if (u.includes('wa.me') || u.includes('whatsapp')) return 'whatsapp'
  if (u.includes('instagram')) return 'instagram'
  if (u.includes('tiktok')) return 'tiktok'
  if (u.includes('facebook') || u.includes('fb.me')) return 'facebook'
  if (u.includes('youtube') || u.includes('youtu.be')) return 'youtube'
  if (u.includes('twitter.com') || u.includes('x.com')) return 'x'
  if (u.includes('t.me') || u.includes('telegram')) return 'telegram'
  if (u.includes('linkedin')) return 'linkedin'
  if (u.includes('waze')) return 'navigation'
  if (u.includes('maps') || u.includes('goo.gl/maps')) return 'map'
  if (u.includes('rappi') || u.includes('didi') || u.includes('ifood')) return 'delivery'
  if (u.endsWith('.pdf')) return 'pdf'
  if (u.startsWith('tel:')) return 'phone'
  if (u.startsWith('mailto:')) return 'mail'
  return null
}
