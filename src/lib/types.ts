export type LinkType = 'url' | 'menu'

export interface SiteSettings {
  name: string
  description: string
  avatar_url: string | null
}

export interface LinkButton {
  id: string
  label: string
  type: LinkType
  url: string | null
  icon: string
  position: number
  is_active: boolean
}

export interface Category {
  id: string
  name: string
  description: string | null
  emoji: string | null
  image_url: string | null
  position: number
  is_active: boolean
}

/** Agrupa productos dentro de una categoría (ej. Bebidas → Jugos, Cervezas). */
export interface Subcategory {
  id: string
  category_id: string
  name: string
  position: number
}

export interface MenuItem {
  id: string
  category_id: string
  subcategory_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  position: number
  is_available: boolean
  is_active: boolean
}

export type Draft<T extends { id: string }> = Omit<T, 'id' | 'position'> & { id?: string; position?: number }
