import type { SVGProps } from 'react'
import { Bike, BookOpen, CalendarDays, Gift, Globe, Link, Mail, MapPin, Phone, Star, Ticket, UtensilsCrossed, type LucideIcon } from 'lucide-react'

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

const fromLucide = (Icon: LucideIcon) => ({ size, ...p }: IconProps) => <Icon size={size} strokeWidth={2} aria-hidden {...(p as object)} />

export const ICONS = {
  menu: { label: 'Carta', Icon: fromLucide(UtensilsCrossed) },
  whatsapp: { label: 'WhatsApp', Icon: WhatsApp },
  instagram: { label: 'Instagram', Icon: Instagram },
  tiktok: { label: 'TikTok', Icon: TikTok },
  facebook: { label: 'Facebook', Icon: Facebook },
  map: { label: 'Ubicación', Icon: fromLucide(MapPin) },
  calendar: { label: 'Reservas', Icon: fromLucide(CalendarDays) },
  phone: { label: 'Teléfono', Icon: fromLucide(Phone) },
  delivery: { label: 'Domicilios', Icon: fromLucide(Bike) },
  star: { label: 'Reseñas', Icon: fromLucide(Star) },
  ticket: { label: 'Eventos', Icon: fromLucide(Ticket) },
  gift: { label: 'Promos', Icon: fromLucide(Gift) },
  book: { label: 'Historia', Icon: fromLucide(BookOpen) },
  mail: { label: 'Correo', Icon: fromLucide(Mail) },
  web: { label: 'Web', Icon: fromLucide(Globe) },
  link: { label: 'Enlace', Icon: fromLucide(Link) },
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
  if (u.includes('maps') || u.includes('waze') || u.includes('goo.gl/maps')) return 'map'
  if (u.includes('rappi') || u.includes('didi') || u.includes('ifood')) return 'delivery'
  if (u.startsWith('tel:')) return 'phone'
  if (u.startsWith('mailto:')) return 'mail'
  return null
}
