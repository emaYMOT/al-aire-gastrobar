const cop = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

/** 25000 -> "$25.000" */
export function formatPrice(value: number): string {
  return `$${cop.format(value)}`
}

/** "25.000" | "$25,000" -> 25000 */
export function parsePrice(input: string): number {
  const digits = input.replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

/** Agrega https:// si el admin escribió "wa.me/57..." */
export function normalizeUrl(input: string): string {
  const value = input.trim()
  if (!value) return value
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value
  return `https://${value}`
}

export function isValidUrl(input: string): boolean {
  try {
    const url = new URL(normalizeUrl(input))
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.hostname.includes('.')
    return url.protocol === 'mailto:' || url.protocol === 'tel:'
  } catch {
    return false
  }
}

export function bySort<T extends { position: number }>(a: T, b: T) {
  return a.position - b.position
}
