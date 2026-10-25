import { ExternalLink, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { store, type AdminSession } from '../../lib/store'
import { clearPublicCache } from '../../lib/useCached'
import CategoryEditor from './CategoryEditor'
import LinksEditor from './LinksEditor'
import Login from './Login'
import MenuEditor from './MenuEditor'
import ProfileEditor from './ProfileEditor'

export default function AdminApp() {
  const [session, setSession] = useState<AdminSession | null | undefined>(undefined)

  useEffect(() => {
    document.body.style.background = 'var(--color-papel)'
    store.getSession().then(setSession, () => setSession(null))
    // Al salir del panel, la página pública vuelve a pedir los datos recién editados.
    return () => {
      document.body.style.background = ''
      clearPublicCache()
    }
  }, [])

  async function signOut() {
    await store.signOut()
    setSession(null)
  }

  return (
    <div className="min-h-dvh bg-papel text-tinta">
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '14px', fontWeight: 500 }, duration: 3500, success: { duration: 3000 }, error: { duration: 5000 } }} />
      {session === undefined ? null : session === null ? (
        <Login onSignedIn={setSession} />
      ) : (
        <>
          <header className="sticky top-0 z-20 border-b border-linea bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
              <div className="flex-1">
                <p className="font-display text-[1.4rem] leading-none">al aire</p>
                <p className="text-xs text-gris">Panel de administración</p>
              </div>
              <a href="#/" target="_blank" rel="noopener" aria-label="Ver página (se abre en otra pestaña)" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-papel">
                <ExternalLink size={17} /> <span className="hidden sm:inline">Ver página</span>
              </a>
              <button type="button" onClick={signOut} aria-label="Cerrar sesión" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-gris transition-colors hover:bg-papel hover:text-tinta" title="Cerrar sesión">
                <LogOut size={17} /> <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
            <nav className="mx-auto flex max-w-3xl gap-1 px-3" aria-label="Secciones del panel">
              {[
                ['/admin/botones', 'Botones'],
                ['/admin/carta', 'Carta'],
                ['/admin/perfil', 'Perfil'],
              ].map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative px-4 py-3 text-[0.95rem] font-semibold transition ${isActive ? 'text-tinta after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:bg-cobre' : 'text-gris hover:text-tinta'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </header>

          {store.mode === 'demo' && (
            <p className="mx-auto mt-4 max-w-3xl px-4">
              <span className="block rounded-xl bg-cobre/12 px-4 py-3 text-sm">
                <strong>Modo demo.</strong> Los cambios se guardan solo en este navegador. Cuando conectes Supabase se publicarán para todos.
              </span>
            </p>
          )}

          <main className="mx-auto max-w-3xl px-4 pt-6 pb-24">
            <Routes>
              <Route index element={<Navigate to="/admin/botones" replace />} />
              <Route path="botones" element={<LinksEditor />} />
              <Route path="carta" element={<MenuEditor />} />
              <Route path="carta/:categoryId" element={<CategoryEditor />} />
              <Route path="perfil" element={<ProfileEditor />} />
              <Route path="*" element={<Navigate to="/admin/botones" replace />} />
            </Routes>
          </main>
        </>
      )}
    </div>
  )
}

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[2rem] leading-tight">{title}</h1>
        {description && <p className="mt-1.5 max-w-[52ch] text-gris">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border-2 border-dashed border-linea px-6 py-10 text-center text-gris">{children}</div>
}
