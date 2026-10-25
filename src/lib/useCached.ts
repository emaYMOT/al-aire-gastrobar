import { useEffect, useState } from 'react'

// Caché simple para la vista pública: ir de la carta a una categoría y volver no vuelve a pedir datos.
const values = new Map<string, unknown>()
const pending = new Map<string, Promise<unknown>>()

export function clearPublicCache() {
  values.clear()
  pending.clear()
}

export function useCached<T>(key: string, loader: () => Promise<T>) {
  const [state, setState] = useState<{ data?: T; error?: string }>(() => ({ data: values.get(key) as T | undefined }))

  useEffect(() => {
    let alive = true
    let promise = pending.get(key) as Promise<T> | undefined
    if (!promise) {
      promise = loader()
      pending.set(key, promise)
    }
    promise.then(
      (data) => {
        values.set(key, data)
        if (alive) setState({ data })
      },
      (error: Error) => {
        pending.delete(key)
        if (alive) setState({ error: error.message })
      },
    )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
