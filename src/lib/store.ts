import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import imageCompression from 'browser-image-compression'
import { bySort } from './format'
import { seedCategories, seedItems, seedLinks, seedSettings, seedSubcategories } from './seed'
import type { Category, Draft, LinkButton, MenuItem, SiteSettings, Subcategory } from './types'

export type Collection = 'links' | 'menu_categories' | 'menu_subcategories' | 'menu_items'
export type RowOf<C extends Collection> = C extends 'links'
  ? LinkButton
  : C extends 'menu_categories'
    ? Category
    : C extends 'menu_subcategories'
      ? Subcategory
      : MenuItem

export type ImageFolder = 'avatar' | 'items' | 'categories'

const MAX_SIDE: Record<ImageFolder, [number, number]> = {
  // [Supabase, modo demo]: el demo guarda en el navegador, así que va más liviano.
  avatar: [600, 400],
  items: [1200, 800],
  categories: [1600, 1000],
}

export interface AdminSession {
  email: string
}

/**
 * Todo el acceso a datos pasa por aquí. Hay dos implementaciones:
 * - Supabase (producción), cuando existen VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
 * - Demo, que guarda en localStorage para probar la web sin base de datos.
 */
export interface DataStore {
  mode: 'supabase' | 'demo'
  getSettings(): Promise<SiteSettings>
  updateSettings(patch: Partial<SiteSettings>): Promise<void>
  list<C extends Collection>(collection: C): Promise<RowOf<C>[]>
  save<C extends Collection>(collection: C, row: Draft<RowOf<C>>): Promise<RowOf<C>>
  remove(collection: Collection, id: string): Promise<void>
  reorder(collection: Collection, orderedIds: string[]): Promise<void>
  uploadImage(file: File, folder: ImageFolder): Promise<string>
  getSession(): Promise<AdminSession | null>
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
}

async function compress(file: File, maxSide: number): Promise<File> {
  return imageCompression(file, { maxSizeMB: 0.35, maxWidthOrHeight: maxSide, fileType: 'image/webp', useWebWorker: true })
}

// ---------------------------------------------------------------- Supabase

function supabaseStore(client: SupabaseClient): DataStore {
  const fail = (error: { message: string } | null) => {
    if (error) throw new Error(translateError(error.message))
  }

  return {
    mode: 'supabase',

    async getSettings() {
      const { data, error } = await client.from('site_settings').select('name, description, avatar_url').eq('id', 1).maybeSingle()
      fail(error)
      return data ?? seedSettings
    },

    async updateSettings(patch) {
      const { error } = await client.from('site_settings').update(patch).eq('id', 1)
      fail(error)
    },

    async list(collection) {
      const { data, error } = await client.from(collection).select('*').order('position')
      fail(error)
      return (data ?? []) as never
    },

    async save(collection, row) {
      const { id, ...fields } = row as Draft<RowOf<Collection>>
      if (id) {
        const { data, error } = await client.from(collection).update(fields).eq('id', id).select().single()
        fail(error)
        return data as never
      }
      const { data: last } = await client.from(collection).select('position').order('position', { ascending: false }).limit(1)
      const position = (last?.[0]?.position ?? -1) + 1
      const { data, error } = await client.from(collection).insert({ ...fields, position }).select().single()
      fail(error)
      return data as never
    },

    async remove(collection, id) {
      const { error } = await client.from(collection).delete().eq('id', id)
      fail(error)
    },

    async reorder(collection, orderedIds) {
      const results = await Promise.all(orderedIds.map((id, position) => client.from(collection).update({ position }).eq('id', id)))
      fail(results.find((r) => r.error)?.error ?? null)
    },

    async uploadImage(file, folder) {
      const small = await compress(file, MAX_SIDE[folder][0])
      const path = `${folder}/${crypto.randomUUID()}.webp`
      const { error } = await client.storage.from('media').upload(path, small, { contentType: 'image/webp', cacheControl: '31536000' })
      fail(error)
      return client.storage.from('media').getPublicUrl(path).data.publicUrl
    },

    async getSession() {
      const { data } = await client.auth.getSession()
      const user = data.session?.user
      if (!user) return null
      const { data: admin } = await client.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
      if (!admin) {
        await client.auth.signOut()
        return null
      }
      return { email: user.email ?? '' }
    },

    async signIn(email, password) {
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      fail(error)
      const { data: admin } = await client.from('admins').select('user_id').eq('user_id', data.user?.id ?? '').maybeSingle()
      if (!admin) {
        await client.auth.signOut()
        throw new Error('Esta cuenta no tiene permiso de administrador. Agrégala a la tabla admins en Supabase.')
      }
    },

    async signOut() {
      await client.auth.signOut()
    },
  }
}

function translateError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Correo o contraseña incorrectos.'
  if (/row-level security/i.test(message)) return 'No tienes permiso para hacer este cambio. Vuelve a iniciar sesión.'
  if (/failed to fetch|network/i.test(message)) return 'No hay conexión con la base de datos. Revisa tu internet e inténtalo de nuevo.'
  return message
}

// ---------------------------------------------------------------- Demo (localStorage)

const DEMO_KEY = 'alaire-demo-v3'

interface DemoData {
  settings: SiteSettings
  links: LinkButton[]
  menu_categories: Category[]
  menu_subcategories: Subcategory[]
  menu_items: MenuItem[]
  session: AdminSession | null
}

function demoStore(): DataStore {
  const fresh = (): DemoData => ({
    settings: seedSettings,
    links: seedLinks,
    menu_categories: seedCategories,
    menu_subcategories: seedSubcategories,
    menu_items: seedItems,
    session: null,
  })

  const read = (): DemoData => {
    try {
      const raw = localStorage.getItem(DEMO_KEY)
      return raw ? { ...fresh(), ...JSON.parse(raw) } : fresh()
    } catch {
      return fresh()
    }
  }

  const write = (data: DemoData) => {
    try {
      localStorage.setItem(DEMO_KEY, JSON.stringify(data))
    } catch {
      throw new Error('El navegador no tiene espacio para guardar más en modo demo. Usa fotos más livianas o conecta Supabase.')
    }
  }

  const delay = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 120))

  return {
    mode: 'demo',

    getSettings: async () => delay(read().settings),

    async updateSettings(patch) {
      const data = read()
      data.settings = { ...data.settings, ...patch }
      write(data)
      await delay(null)
    },

    async list(collection) {
      return delay([...read()[collection]].sort(bySort) as never)
    },

    async save(collection, row) {
      const data = read()
      const rows = data[collection] as RowOf<Collection>[]
      let saved: RowOf<Collection>
      if (row.id) {
        const index = rows.findIndex((r) => r.id === row.id)
        saved = { ...rows[index], ...row } as RowOf<Collection>
        rows[index] = saved
      } else {
        const position = rows.reduce((max, r) => Math.max(max, r.position), -1) + 1
        saved = { ...row, id: crypto.randomUUID(), position } as unknown as RowOf<Collection>
        rows.push(saved)
      }
      write(data)
      return delay(saved as never)
    },

    async remove(collection, id) {
      const data = read()
      ;(data[collection] as RowOf<Collection>[]) = (data[collection] as RowOf<Collection>[]).filter((r) => r.id !== id)
      // Igual que en la base: la categoría se lleva sus subcategorías y productos; la subcategoría no borra productos.
      if (collection === 'menu_categories') {
        data.menu_subcategories = data.menu_subcategories.filter((s) => s.category_id !== id)
        data.menu_items = data.menu_items.filter((i) => i.category_id !== id)
      }
      if (collection === 'menu_subcategories') {
        data.menu_items = data.menu_items.map((i) => (i.subcategory_id === id ? { ...i, subcategory_id: null } : i))
      }
      write(data)
      await delay(null)
    },

    async reorder(collection, orderedIds) {
      const data = read()
      for (const row of data[collection] as RowOf<Collection>[]) {
        const index = orderedIds.indexOf(row.id)
        if (index >= 0) row.position = index
      }
      write(data)
      await delay(null)
    },

    async uploadImage(file, folder) {
      const small = await compress(file, MAX_SIDE[folder][1])
      return imageCompression.getDataUrlFromFile(small)
    },

    getSession: async () => delay(read().session),

    async signIn(email) {
      const data = read()
      data.session = { email: email || 'demo' }
      write(data)
    },

    async signOut() {
      const data = read()
      data.session = null
      write(data)
    },
  }
}

// ----------------------------------------------------------------

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const store: DataStore = url && anonKey ? supabaseStore(createClient(url, anonKey)) : demoStore()

/** Para la vista pública: solo lo visible, en orden. */
export async function loadPublicMenu() {
  const [categories, subcategories, items] = await Promise.all([
    store.list('menu_categories'),
    // Si la base todavía no tiene subcategorías (falta correr subcategorias.sql), la carta se ve sin secciones.
    store.list('menu_subcategories').catch(() => [] as Subcategory[]),
    store.list('menu_items'),
  ])
  const visibleCategories = categories.filter((c) => c.is_active).sort(bySort)
  const visibleItems = items.filter((i) => i.is_active).sort(bySort)
  const sortedSubcategories = [...subcategories].sort(bySort)
  return {
    categories: visibleCategories
      .map((category) => {
        const own = visibleItems.filter((i) => i.category_id === category.id)
        const subs = sortedSubcategories.filter((s) => s.category_id === category.id)
        const known = new Set(subs.map((s) => s.id))
        const sections: MenuSection[] = [
          // Primero lo que no tiene subcategoría, sin título.
          { id: null, name: null, items: own.filter((i) => !i.subcategory_id || !known.has(i.subcategory_id)) },
          ...subs.map((s) => ({ id: s.id, name: s.name, items: own.filter((i) => i.subcategory_id === s.id) })),
        ].filter((s) => s.items.length > 0)
        return { ...category, items: sections.flatMap((s) => s.items), sections }
      })
      .filter((c) => c.items.length > 0),
  }
}

export interface MenuSection {
  id: string | null
  name: string | null
  items: MenuItem[]
}

export type PublicCategory = Awaited<ReturnType<typeof loadPublicMenu>>['categories'][number]
