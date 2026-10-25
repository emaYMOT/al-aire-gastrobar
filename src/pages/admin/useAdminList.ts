import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { bySort } from '../../lib/format'
import { store, type Collection, type RowOf } from '../../lib/store'
import type { Draft } from '../../lib/types'

/** Carga una tabla y expone acciones que actualizan la pantalla al instante y avisan si algo falla. */
export function useAdminList<C extends Collection>(collection: C) {
  const [rows, setRows] = useState<RowOf<C>[] | null>(null)

  const reload = useCallback(async () => {
    try {
      setRows(((await store.list(collection)) as RowOf<C>[]).sort(bySort))
    } catch (e) {
      toast.error((e as Error).message)
    }
  }, [collection])

  useEffect(() => {
    reload()
  }, [reload])

  async function save(row: Draft<RowOf<C>>, message = 'Guardado') {
    try {
      const saved = (await store.save(collection, row)) as RowOf<C>
      setRows((current) => {
        const list = current ?? []
        return list.some((r) => r.id === saved.id) ? list.map((r) => (r.id === saved.id ? saved : r)) : [...list, saved]
      })
      toast.success(message)
      return saved
    } catch (e) {
      toast.error((e as Error).message)
      throw e
    }
  }

  async function patch(id: string, fields: Partial<RowOf<C>>, message?: string) {
    const current = rows?.find((r) => r.id === id)
    if (!current) return
    setRows((list) => list?.map((r) => (r.id === id ? { ...r, ...fields } : r)) ?? null)
    try {
      await store.save(collection, { ...current, ...fields } as Draft<RowOf<C>>)
      if (message) toast.success(message)
    } catch (e) {
      toast.error((e as Error).message)
      reload()
    }
  }

  async function remove(id: string, message = 'Eliminado') {
    setRows((list) => list?.filter((r) => r.id !== id) ?? null)
    try {
      await store.remove(collection, id)
      toast.success(message)
    } catch (e) {
      toast.error((e as Error).message)
      reload()
    }
  }

  /** Recibe solo la parte reordenada (por ejemplo, los platos de una categoría). */
  async function reorder(ordered: RowOf<C>[]) {
    const positions = new Map(ordered.map((r, i) => [r.id, i]))
    setRows((list) => list?.map((r) => (positions.has(r.id) ? { ...r, position: positions.get(r.id)! } : r)).sort(bySort) ?? null)
    try {
      await store.reorder(collection, ordered.map((r) => r.id))
      toast.success('Orden guardado', { id: 'orden' })
    } catch (e) {
      toast.error((e as Error).message)
      reload()
    }
  }

  return { rows, reload, save, patch, remove, reorder }
}
