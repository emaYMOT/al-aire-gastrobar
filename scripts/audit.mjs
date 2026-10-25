// Auditoría de UI/UX (reglas de la skill UI UX Pro Max, prioridades 1-5).
// Uso: con `npm run dev` corriendo, ejecutar `node scripts/audit.mjs`.
// Mide en cada pantalla: tamaño táctil, contraste, alt de imágenes, jerarquía de títulos,
// nombres accesibles, desborde horizontal (375 px, horizontal y texto al 200 %).
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://localhost:5173/'
const pages = [
  ['Inicio', '#/'],
  ['Carta', '#/carta'],
  ['Categoría', '#/carta/c2'],
  ['Login', '#/admin', { loggedOut: true }],
  ['Admin botones', '#/admin/botones'],
  ['Admin carta', '#/admin/carta'],
  ['Admin categoría', '#/admin/carta/c2'],
  ['Admin perfil', '#/admin/perfil'],
  ['Modal botón', '#/admin/botones', { open: 'Agregar botón' }],
  ['Modal plato', '#/admin/carta/c2', { open: 'Agregar plato' }],
  ['Modal categoría', '#/admin/carta', { open: 'Agregar categoría' }],
]

const viewports = [
  ['375', { width: 375, height: 812 }],
  ['horizontal', { width: 812, height: 375 }],
]

function inspect() {
  const out = { small: [], contrast: [], noAlt: [], noName: [], headings: [], overflow: false }
  const lum = (r, g, b) => {
    const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (m) { const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [r, g, b, a] }
    const srgb = c.match(/color\(srgb ([^)]+)\)/)
    if (srgb) { const [r, g, b, a = 1] = srgb[1].split(/[ /]+/).filter(Boolean).map(Number); return [r * 255, g * 255, b * 255, a] }
    const ok = c.match(/oklab\(([^)]+)\)/)
    if (ok) {
      const [L, A, B, alpha = 1] = ok[1].split(/[ /]+/).filter(Boolean).map(Number)
      const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
      const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
      const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
      const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
      const enc = (x) => 255 * Math.min(1, Math.max(0, x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055))
      return [...lin.map(enc), alpha]
    }
    return null
  }
  // Color efectivo de fondo: sube por los ancestros mezclando capas semitransparentes.
  const bgOf = (el) => {
    const layers = []
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('linear-gradient(rgba(0, 0, 0, 0)')) return null // foto o degradado: no medible
      const c = parse(cs.backgroundColor)
      if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break }
    }
    let [r, g, b] = [255, 255, 255]
    for (const [lr, lg, lb, la] of layers.reverse()) { r = lr * la + r * (1 - la); g = lg * la + g * (1 - la); b = lb * la + b * (1 - la) }
    return [r, g, b]
  }
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' }
  const label = (el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40)
  const scope = document.querySelector('dialog[open]') ?? document

  for (const el of scope.querySelectorAll('a, button, input, select, textarea, [role=switch]')) {
    if (!visible(el) && !(el.type === 'checkbox')) continue
    let box = el.getBoundingClientRect()
    if (el.type === 'checkbox' || el.type === 'file') { if (el.type === 'file') continue; box = el.parentElement.getBoundingClientRect() }
    if (box.width < 44 || box.height < 44) out.small.push(`${label(el)} (${Math.round(box.width)}×${Math.round(box.height)})`)
    const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || el.labels?.[0]?.textContent || el.getAttribute('placeholder') || '').trim()
    if (!name) out.noName.push(el.outerHTML.slice(0, 80))
  }
  for (const img of scope.querySelectorAll('img')) if (!img.hasAttribute('alt')) out.noAlt.push(img.src.slice(0, 60))
  for (const h of document.querySelectorAll('h1,h2,h3,h4')) if (visible(h)) out.headings.push(h.tagName)

  const walker = document.createTreeWalker(scope === document ? document.body : scope, NodeFilter.SHOW_TEXT)
  const seen = new Set()
  while (walker.nextNode()) {
    const t = walker.currentNode
    const el = t.parentElement
    if (!t.textContent.trim() || seen.has(el) || !visible(el)) continue
    seen.add(el)
    const cs = getComputedStyle(el)
    const fg = parse(cs.color)
    const bg = bgOf(el)
    if (!fg || !bg) continue
    let opacity = 1
    for (let n = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity)
    const a = fg[3] * opacity
    const mix = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a))
    const L1 = lum(...mix), L2 = lum(...bg)
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
    const size = parseFloat(cs.fontSize), bold = Number(cs.fontWeight) >= 700
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5
    if (ratio < need && !el.closest('[aria-hidden=true]')) out.contrast.push(`"${t.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}:1 (mín ${need})`)
  }
  out.overflow = document.documentElement.scrollWidth > innerWidth + 1
  return out
}

const browser = await chromium.launch()
let problems = 0
for (const [vpName, viewport] of viewports) {
  for (const [name, hash, opts = {}] of pages) {
    const ctx = await browser.newContext({ viewport, hasTouch: true, isMobile: true })
    const page = await ctx.newPage()
    await page.goto(base)
    await page.evaluate((loggedOut) => {
      localStorage.setItem('alaire-demo-v2', JSON.stringify(loggedOut ? {} : { session: { email: 'demo' } }))
    }, !!opts.loggedOut)
    await page.goto(base + hash)
    await page.waitForTimeout(1300)
    if (opts.open) { await page.getByRole('button', { name: opts.open }).first().click(); await page.waitForTimeout(400) }
    const r = await page.evaluate(inspect)
    // Texto al 200 %
    await page.addStyleTag({ content: 'html{font-size:200% !important}' })
    await page.waitForTimeout(200)
    const zoomOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
    const lines = []
    if (r.small.length) lines.push(`  toque < 44px: ${[...new Set(r.small)].join(' | ')}`)
    if (r.contrast.length) lines.push(`  contraste: ${[...new Set(r.contrast)].join(' | ')}`)
    if (r.noAlt.length) lines.push(`  img sin alt: ${r.noAlt.join(' | ')}`)
    if (r.noName.length) lines.push(`  sin nombre accesible: ${r.noName.join(' | ')}`)
    if (r.overflow) lines.push('  desborde horizontal')
    if (zoomOverflow) lines.push('  desborde con texto al 200 %')
    if (vpName === '375') {
      const hs = r.headings
      if (hs.filter((h) => h === 'H1').length !== 1) lines.push(`  títulos: ${hs.join(' ')} (debe haber un solo h1)`)
    }
    console.log(`${lines.length ? '✗' : '✓'} [${vpName}] ${name}`)
    for (const l of lines) console.log(l)
    problems += lines.length
    await ctx.close()
  }
}
await browser.close()
console.log(`\n${problems} hallazgos`)
