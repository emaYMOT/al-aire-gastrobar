// Toma capturas de las pantallas principales en celular y computador.
// Uso: con `npm run dev` corriendo, ejecutar `npm run shots` (opcional: URL base como argumento).
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const base = process.argv[2] ?? 'http://localhost:5173/'
const out = 'screenshots'
await mkdir(out, { recursive: true })

const viewports = { movil: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, escritorio: { width: 1440, height: 900 } }
const pages = [
  ['inicio', '#/'],
  ['carta', '#/carta'],
  ['categoria', '#/carta/c3'],
  ['admin-botones', '#/admin/botones'],
  ['admin-carta', '#/admin/carta'],
  ['admin-categoria', '#/admin/carta/c2'],
  ['admin-perfil', '#/admin/perfil'],
]

const browser = await chromium.launch()
for (const [vpName, vp] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, ...vp })
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  // Entra al modo demo para poder ver el panel.
  await page.goto(base)
  await page.evaluate(() => {
    const raw = localStorage.getItem('alaire-demo-v2')
    const data = raw ? JSON.parse(raw) : {}
    data.session = { email: 'demo' }
    localStorage.setItem('alaire-demo-v2', JSON.stringify(data))
  })
  for (const [name, hash] of pages) {
    await page.goto(base + hash)
    await page.waitForTimeout(1600)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    await page.screenshot({ path: `${out}/${vpName}-${name}.png`, fullPage: name !== 'inicio' })
    console.log(`${vpName}-${name}${overflow ? '  ⚠ scroll horizontal' : ''}`)
  }
  if (errors.length) console.log('Errores de consola:', errors)
  await context.close()
}
await browser.close()
