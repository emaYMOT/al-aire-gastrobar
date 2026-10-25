// Prueba de punta a punta del panel en modo demo (sin Supabase).
// Uso: con `npm run dev` corriendo, ejecutar `node scripts/e2e.mjs`.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'

const base = process.argv[2] ?? 'http://localhost:5173/'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
const step = (name) => console.log('✓', name)

await page.goto(base + '#/admin')
await page.evaluate(() => localStorage.clear())
await page.reload()
await page.getByRole('button', { name: 'Entrar al modo demo' }).click()
await page.getByRole('heading', { name: 'Botones de inicio' }).waitFor()
step('entra al panel')

// Nuevo botón con enlace: el ícono se adivina a partir de la URL.
await page.getByRole('button', { name: 'Agregar botón' }).click()
await page.getByRole('button', { name: 'Agregar botón' }).last().click()
await page.getByText('Escribe el texto del botón.').waitFor()
step('valida campos vacíos')
await page.getByRole('textbox', { name: /^Texto del botón/ }).fill('Pide a domicilio')
await page.getByRole('textbox', { name: /^Enlace/ }).fill('www.rappi.com.co/restaurantes/al-aire')
assert.equal(await page.getByRole('button', { name: 'Domicilios' }).getAttribute('aria-pressed'), 'true')
await page.screenshot({ path: 'screenshots/e2e-modal-boton.png' })
await page.getByRole('button', { name: 'Agregar botón' }).last().click()
await page.getByText('Botón agregado').waitFor()
await page.getByText('rappi.com.co/restaurantes/al-aire').waitFor()
step('crea botón con enlace (agrega https:// y adivina el ícono)')

// Ocultar Instagram.
const instagramRow = page.locator('li', { hasText: 'Instagram' })
await instagramRow.getByRole('switch').click({ force: true })
await page.getByText('Botón oculto').waitFor()
step('oculta un botón')

// Editar y luego eliminar "Cómo llegar" desde su ventana.
await page.locator('li', { hasText: 'Cómo llegar' }).getByRole('button', { name: 'Editar' }).click()
await page.getByRole('textbox', { name: /^Texto del botón/ }).fill('Cómo llegar a la 13')
await page.getByRole('button', { name: 'Guardar cambios' }).click()
await page.getByText('Cómo llegar a la 13').waitFor()
await page.locator('li', { hasText: 'Cómo llegar a la 13' }).getByRole('button', { name: 'Editar' }).click()
await page.getByRole('button', { name: 'Eliminar botón' }).click()
await page.getByRole('button', { name: 'Eliminar botón' }).last().click()
await page.getByText('Botón eliminado').waitFor()
assert.equal(await page.getByText('Cómo llegar a la 13').count(), 0)
step('edita y elimina un botón')

// Carta: nueva categoría y nuevo plato.
await page.getByRole('link', { name: 'Carta' }).click()
await page.getByRole('button', { name: 'Agregar categoría' }).click()
await page.getByRole('textbox', { name: /^Nombre/ }).fill('Brunch')
await page.getByRole('button', { name: '☕' }).click()
await page.getByRole('button', { name: 'Agregar categoría' }).last().click()
await page.getByText('Categoría agregada').waitFor()
await page.getByRole('link', { name: /Brunch/ }).click()
await page.getByText('Esta categoría no tiene platos').waitFor()
step('crea categoría y entra a ella')

await page.getByRole('button', { name: 'Agregar plato' }).click()
await page.getByRole('textbox', { name: /^Nombre/ }).fill('Calentado paisa')
await page.getByLabel('Descripción (opcional)').fill('Frijoles, arroz, chorizo, huevo y arepa.')
await page.getByRole('textbox', { name: /^Precio/ }).fill('2850000')
assert.equal(await page.getByRole('textbox', { name: /^Precio/ }).inputValue(), '2.850.000')
await page.getByRole('textbox', { name: /^Precio/ }).fill('28500')
assert.equal(await page.getByRole('textbox', { name: /^Precio/ }).inputValue(), '28.500')
await page.waitForTimeout(800)
await page.screenshot({ path: 'screenshots/e2e-modal-plato.png' })
await page.getByRole('button', { name: 'Agregar plato' }).last().click()
await page.getByText('Plato agregado').waitFor()
await page.getByText('$28.500').waitFor()
step('crea plato con precio formateado')

await page.getByRole('button', { name: 'Calentado paisa' }).click()
await page.getByRole('switch', { name: 'Disponible hoy' }).or(page.getByText('Disponible hoy')).first().click()
await page.getByRole('button', { name: 'Guardar cambios' }).click()
await page.locator('li', { hasText: 'Calentado paisa' }).getByText('Agotado').waitFor()
step('marca plato como agotado')

// Perfil.
await page.getByRole('link', { name: 'Perfil' }).click()
await page.getByRole('textbox', { name: /^Nombre/ }).fill('Al Aire Gastrobar 13')
await page.getByRole('button', { name: 'Guardar perfil' }).click()
await page.getByText('Perfil guardado').waitFor()
step('edita el perfil')

// Página pública.
await page.goto(base + '#/')
await page.getByRole('heading', { name: 'Al Aire Gastrobar 13' }).waitFor()
assert.equal(await page.getByRole('link', { name: 'Instagram' }).count(), 0)
await page.getByRole('link', { name: 'Pide a domicilio' }).waitFor()
assert.equal(await page.getByRole('link', { name: 'Pide a domicilio' }).getAttribute('href'), 'https://www.rappi.com.co/restaurantes/al-aire')
step('inicio público refleja los cambios')

await page.getByRole('link', { name: 'Ver la carta' }).click()
await page.getByRole('link', { name: /Brunch/ }).click()
await page.getByText('Calentado paisa').waitFor()
await page.getByText('Agotado por hoy').waitFor()
await page.screenshot({ path: 'screenshots/e2e-publico-brunch.png', fullPage: true })
step('carta pública muestra la categoría nueva y el plato agotado')

// Reordenar arrastrando (teclado: espacio, flecha, espacio).
await page.goto(base + '#/admin/botones')
await page.getByRole('heading', { name: 'Botones de inicio' }).waitFor()
const first = async () => (await page.locator('ul > li').first().innerText()).split('\n')[0]
const before = await first()
await page.locator('ul > li').nth(1).getByRole('button', { name: 'Arrastra para cambiar el orden' }).focus()
await page.waitForTimeout(300)
await page.keyboard.press('Space')
await page.waitForTimeout(300)
await page.keyboard.press('ArrowUp')
await page.waitForTimeout(400)
await page.keyboard.press('Space')
await page.getByText('Orden guardado').waitFor()
assert.notEqual(await first(), before)
step('reordena con arrastrar y soltar')

// Reordenar sin arrastrar: botones Subir / Bajar dentro de la ventana de edición.
const second = (await page.locator('ul > li').nth(1).innerText()).split('\n')[0]
await page.locator('ul > li').nth(1).getByRole('button', { name: 'Editar' }).click()
await page.getByText('Posición 2 de').waitFor()
await page.getByRole('button', { name: 'Subir' }).click()
await page.getByText('Posición 1 de').waitFor()
await page.getByRole('button', { name: 'Cerrar', exact: true }).click()
assert.equal(await first(), second)
step('reordena con Subir y Bajar (sin arrastrar)')

// Aviso al cerrar con cambios sin guardar.
await page.locator('ul > li').first().getByRole('button', { name: 'Editar' }).click()
await page.getByRole('textbox', { name: /^Texto del botón/ }).fill('Texto cambiado')
await page.keyboard.press('Escape')
await page.getByText('Tienes cambios sin guardar').waitFor()
await page.getByRole('button', { name: 'Seguir editando' }).click()
assert.equal(await page.getByRole('textbox', { name: /^Texto del botón/ }).inputValue(), 'Texto cambiado')
await page.getByRole('button', { name: 'Cancelar' }).click()
await page.getByRole('button', { name: 'Descartar cambios' }).click()
assert.equal(await page.getByText('Texto cambiado').count(), 0)
step('avisa antes de perder cambios sin guardar')

// El foco va al primer campo con error.
await page.getByRole('button', { name: 'Agregar botón' }).click()
await page.getByRole('button', { name: 'Agregar botón' }).last().click()
await page.waitForFunction(() => document.activeElement?.getAttribute('aria-invalid') === 'true', null, { timeout: 3000 })
step('lleva el foco al primer campo con error')

assert.deepEqual(errors, [])
console.log('\nTodo bien.')
await browser.close()
