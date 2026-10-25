import { ArrowRight, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import CategoryCover from '../components/CategoryCover'
import { loadPublicMenu } from '../lib/store'
import { useCached } from '../lib/useCached'
import { useRouteFocus } from '../lib/useRouteFocus'

export default function Menu() {
  const { data, error } = useCached('menu', loadPublicMenu)
  const main = useRouteFocus<HTMLElement>()

  return (
    <main ref={main} tabIndex={-1} aria-labelledby="titulo-carta" className="min-h-dvh outline-none">
      <div className="mx-auto max-w-3xl px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-16 sm:px-6">
        <Link to="/" viewTransition className="-ml-1 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm text-niebla transition-colors hover:text-cal">
          <ChevronLeft size={18} aria-hidden />
          Inicio
        </Link>

        <header className="mt-6 px-1">
          <h1 id="titulo-carta" className="font-display text-[3.25rem] leading-none sm:text-[4.5rem]">Nuestra carta</h1>
          <p className="mt-4 text-niebla">Elige qué se te antoja.</p>
        </header>

        {error && <p className="mt-10 px-1 text-niebla">No pudimos cargar la carta. Revisa tu conexión y vuelve a intentarlo.</p>}
        {data && data.categories.length === 0 && <p className="mt-10 px-1 text-niebla">La carta se está actualizando. Vuelve en un rato.</p>}

        {!data && !error && (
          <div className="mt-9 flex flex-col gap-4 sm:gap-5" aria-busy="true" aria-label="Cargando la carta">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[clamp(13.5rem,62vw,22rem)] rounded-[1.75rem] bg-noche-2/50 motion-safe:animate-pulse" />
            ))}
          </div>
        )}

        <ul className="mt-9 flex flex-col gap-4 sm:gap-5">
          {(data?.categories ?? []).map((category, index) => (
            <li key={category.id}>
              <Link
                to={`/carta/${category.id}`}
                viewTransition
                className="group relative block h-[clamp(13.5rem,62vw,22rem)] overflow-hidden rounded-[1.75rem] bg-noche-2/30 ring-1 ring-white/8 transition hover:ring-cobre/50 active:scale-[.99]"
              >
                <CategoryCover category={category} index={index} eager={index < 2} />
                {/* Difuminado para que el nombre se lea sobre cualquier foto. */}
                <div className="absolute inset-0 bg-gradient-to-t from-noche/95 via-noche/45 via-45% to-noche/5" />
                <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 sm:p-7">
                  <div className="min-w-0 flex-1">
                    <span className="etiqueta inline-block rounded-full bg-noche/60 px-2.5 py-1 text-cobre-2 backdrop-blur-md">
                      {category.items.length} {category.items.length === 1 ? 'opción' : 'opciones'}
                    </span>
                    <h2 className="mt-2 font-display text-[2.1rem] leading-[1.02] text-cal text-balance sm:text-[2.75rem]">{category.name}</h2>
                    {category.description && <p className="mt-2 line-clamp-1 max-w-[46ch] text-sm text-cal/70">{category.description}</p>}
                  </div>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-cobre text-noche shadow-[0_10px_30px_-10px_rgba(217,122,66,.9)] transition group-hover:translate-x-1">
                    <ArrowRight size={20} aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
