# Al Aire Gastrobar · página web

Página tipo Linktree con video de fondo, carta digital por categorías y panel de administración.

- **Inicio** (`/`): foto de perfil, descripción y botones.
- **Carta** (`/carta`): cada categoría es un botón; al tocarla se ven solo sus platos.
- **Panel** (`/admin`): editar botones, carta (categorías, platos, precios, fotos, agotados) y perfil.

Hecha con React + Vite + Tailwind. Los datos viven en **Supabase** y la web se publica gratis en **Cloudflare Pages**.

> Sin Supabase configurado la web funciona en **modo demo**: el panel guarda los cambios solo en tu navegador. Sirve para probar.

---

## 1. Probar en tu computador

Necesitas [Node.js](https://nodejs.org) 20 o más reciente.

```bash
npm install
npm run dev
```

Abre http://localhost:5173. El panel está en http://localhost:5173/admin.

### Ver en el celular

Con el celular conectado al **mismo Wi-Fi** que el computador:

```bash
npm run dev:movil
```

En la salida aparece una línea `Network: http://192.168.x.x:5173/`. Abre esa dirección en el navegador del celular. Si Windows pregunta por el firewall, elige *Permitir en redes privadas* (la red Wi-Fi debe estar marcada como **Privada** en Windows).

## 2. Crear la base de datos en Supabase

1. Crea una cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo (región: São Paulo o la más cercana).
2. Ve a **SQL Editor → New query**, pega todo el contenido de [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**.
3. (Opcional) Haz lo mismo con [`supabase/seed.sql`](supabase/seed.sql) para cargar la carta de ejemplo.
4. **Desactiva el registro público:** Authentication → Sign In / Providers → apaga *Allow new users to sign up*.
5. **Crea el usuario administrador:** Authentication → Users → *Add user → Create new user*. Pon el correo y una contraseña, y marca *Auto Confirm User*.
6. **Dale permiso de admin** en el SQL Editor (cambia el correo):

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'correo-del-admin@ejemplo.com';
   ```

   Repite los pasos 5 y 6 para cada persona que deba editar.

7. Copia los datos de conexión desde **Project Settings → API**: *Project URL* y la clave *anon public*.

Para usarlos en tu computador, copia `.env.example` como `.env` y pégalos ahí. La clave *anon* es pública por diseño; lo que protege los datos son las reglas de seguridad de `schema.sql` (solo los usuarios en la tabla `admins` pueden escribir).

## 3. Publicar en Cloudflare Pages

El proyecto ya está creado y conectado al repositorio de GitHub:

- **Sitio:** https://alaire.pages.dev
- **Repositorio:** `emaYMOT/al-aire-gastrobar`, rama `main`
- **Build:** `npm run build` → carpeta `dist`, con Node 22

Cada vez que subas cambios a `main`, Cloudflare compila y publica solo (en **Workers & Pages → alaire → Deployments** puedes ver el progreso). Las ramas y los PR generan despliegues de vista previa.

Las variables de entorno se configuran en **Workers & Pages → alaire → Settings → Environment variables** (para *Production* y *Preview*):

| Variable | Valor |
| --- | --- |
| `NODE_VERSION` | `22` |
| `VITE_SUPABASE_URL` | el Project URL de Supabase |
| `VITE_SUPABASE_ANON_KEY` | la clave anon public |

### Dominio propio

En **Workers & Pages → alaire → Custom domains** puedes agregar un dominio (por ejemplo `alairegastrobar.com`). Si el dominio está en Cloudflare se configura automáticamente; si no, te dan los registros DNS a copiar. No hay que cambiar nada en el código.

Para crear un proyecto nuevo desde cero: **Workers & Pages → Create → Pages → Connect to Git**, eliges el repo, y en *Build settings* pones el comando `npm run build`, el directorio `dist` y las tres variables de arriba. La URL queda en `https://<nombre-del-proyecto>.pages.dev`.

### Rutas limpias

Las direcciones son reales (`/carta`, `/admin`), sin el `#/`. El archivo [`public/_redirects`](public/_redirects) le dice a Cloudflare que devuelva `index.html` en cualquier ruta, y `vite.config.ts` sirve los assets desde la raíz (`/`).

> Esto es propio de Cloudflare Pages: GitHub Pages no respeta `_redirects` y publica en una subcarpeta. Si algún día vuelves a GitHub Pages habría que volver a `createHashRouter` y `base: './'`. El flujo [`deploy.yml`](.github/workflows/deploy.yml) sigue en el repo, pero ya no publica las rutas limpias.

**Supabase en pausa:** el plan gratis pausa los proyectos tras unos 7 días sin uso. El flujo [`keepalive.yml`](.github/workflows/keepalive.yml) hace una consulta cada 3 días para evitarlo (sigue activo aunque el sitio se publique en Cloudflare, porque vive en GitHub Actions).

## 4. Cambiar el video de fondo

El video vive en el repositorio, en `public/media/`, para no gastar el límite de transferencia de Supabase.

1. Prepara el video: **720p, sin audio, idealmente menos de 6 MB** (límite de Cloudflare Pages: 25 MB por archivo). Entre más liviano, más rápido carga en celular.
   - Fácil: [HandBrake](https://handbrake.fr) → preset *Web / Creator 720p*, quita la pista de audio.
   - Con ffmpeg:
     ```bash
     ffmpeg -i original.mp4 -vf "scale=-2:720" -an -c:v libx264 -crf 28 -preset slow -movflags +faststart public/media/hero.mp4
     ```
     ```bash
     ffmpeg -i public/media/hero.mp4 -frames:v 1 -q:v 4 public/media/hero-poster.jpg
     ```
2. Guárdalo como `public/media/hero.mp4` (y la foto fija como `hero-poster.jpg`).
3. Sube el cambio a GitHub; en un par de minutos se ve en la web.

Mientras no haya video, el inicio muestra una ladera de noche con luces animadas.

## 5. Usar el panel

Entra a `/admin` con el correo y contraseña del administrador.

| Pestaña | Qué se hace |
| --- | --- |
| **Botones** | Agregar, editar, ocultar (interruptor) y reordenar (arrastrar ⋮⋮) los botones del inicio. Cada botón abre un enlace o la carta. Al pegar un enlace de WhatsApp, Instagram, Maps, etc. el ícono se elige solo. |
| **Carta** | Crear categorías con emoji, reordenarlas y ocultarlas. Dentro de cada categoría: agregar platos con descripción, precio y foto; marcarlos como **agotado** u ocultarlos sin borrarlos. |
| **Perfil** | Foto de perfil, nombre y descripción del inicio. |

Las fotos se comprimen automáticamente antes de subirse. Eliminar algo se hace desde su ventana de edición y siempre pide confirmación.

## Estructura

```
src/
  pages/Home.tsx, Menu.tsx, MenuCategory.tsx   vista pública
  pages/admin/                                 panel
  components/                                  piezas reutilizables (modal, lista arrastrable, subir foto…)
  lib/store.ts                                 acceso a datos (Supabase o modo demo)
  lib/seed.ts                                  contenido de ejemplo del modo demo
supabase/schema.sql, seed.sql                  base de datos
public/media/                                  video de fondo
scripts/                                       capturas y prueba automática con Playwright
```

Pruebas visuales y de funcionamiento (con `npm run dev` corriendo):

```bash
npm run shots
```

```bash
node scripts/e2e.mjs
```
