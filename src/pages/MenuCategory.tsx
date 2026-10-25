import { ChevronLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import CategoryCover from '../components/CategoryCover'
import { formatPrice } from '../lib/format'
import { loadPublicMenu, type PublicCategory } from '../lib/store'
import { useCached } from '../lib/useCached'
import { useRouteFocus } from '../lib/useRouteFocus'

export default function MenuCategory() {
  const { categoryId } = useParams()
  const { data, error } = useCached('menu', loadPublicMenu)
  const activeChip = useRef<HTMLAnchorElement>(null)
  const main = useRouteFocus<HTMLElement>()

  useEffect(() => {
    activeChip.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
    window.scrollTo({ top: 0 })
  }, [categoryId, data])

  const category = data?.categories.find((c) => c.id === categoryId)
  if (data && !category) return <Navigate to="/carta" replace />

  return (
    <main ref={main} tabIndex={-1} className="min-h-dvh outline-none">
      <div className="sticky top-0 z-10 border-b border-white/8 bg-noche/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-1 px-3 py-2.5">
          <Link to="/carta" viewTransition aria-label="Volver a la carta" className="grid size-11 shrink-0 place-items-center rounded-full text-cal transition-colors hover:bg-white/8">
            <ChevronLeft size={22} aria-hidden />
          </Link>
          <nav className="no-scrollbar -mr-3 flex gap-2 overflow-x-auto py-1 pr-3" aria-label="Categorías">
            {data?.categories.map((c) => {
              const active = c.id === categoryId
              return (
                <Link
                  key={c.id}
                  ref={active ? activeChip : undefined}
                  to={`/carta/${c.id}`}
                  replace
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    active ? 'bg-cobre text-noche' : 'border border-white/10 bg-noche-2/60 text-cal/80 hover:border-cobre/40 hover:text-cal'
                  }`}
                >
                  {c.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4 pb-20 sm:px-6">
        {error && <p className="text-niebla">No pudimos cargar la carta. Revisa tu conexión y vuelve a intentarlo.</p>}
        {!data && !error && (
          <div aria-busy="true" aria-label="Cargando">
            <div className="h-[clamp(12rem,52vw,19rem)] rounded-[1.75rem] bg-noche-2/80 motion-safe:animate-pulse" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="mt-6 space-y-2 px-1">
                <div className="h-5 w-1/2 rounded bg-noche-2/80 motion-safe:animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-noche-2/60 motion-safe:animate-pulse" />
              </div>
            ))}
          </div>
        )}
        {category && <CategoryItems category={category} index={data!.categories.indexOf(category)} />}
      </div>
    </main>
  )
}

function CategoryItems({ category, index }: { category: PublicCategory; index: number }) {
  return (
    <>
      <header className="relative h-[clamp(12rem,52vw,19rem)] overflow-hidden rounded-[1.75rem] ring-1 ring-white/8">
        <CategoryCover category={category} index={index} eager />
        <div className="absolute inset-0 bg-gradient-to-t from-noche/95 via-noche/30 via-50% to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <span className="etiqueta inline-block rounded-full bg-noche/60 px-2.5 py-1 text-cobre-2 backdrop-blur-md">
            {category.items.length} {category.items.length === 1 ? 'opción' : 'opciones'}
          </span>
          <h1 className="mt-2 font-display text-[2.6rem] leading-[1.02] text-balance sm:text-[3.25rem]">{category.name}</h1>
        </div>
      </header>
      {category.description && <p className="mt-5 max-w-[48ch] px-1 text-cal/80 [text-shadow:0_1px_8px_rgba(17,13,10,.9)]">{category.description}</p>}

      <ul className="mt-5 flex flex-col gap-3">
        {category.items.map((item) => (
          <li key={item.id} className="vidrio flex gap-4 rounded-3xl border border-white/10 bg-noche/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_12px_30px_-18px_rgba(0,0,0,.8)] sm:p-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[1.0625rem] leading-snug font-semibold text-cal">{item.name}</h2>
                <span className={`shrink-0 font-precio text-[1.2rem] leading-none font-medium lining-nums tabular-nums ${item.is_available ? 'text-cobre' : 'text-niebla line-through decoration-1'}`}>
                  {!item.is_available && <span className="sr-only">Precio, agotado: </span>}
                  {formatPrice(item.price)}
                </span>
              </div>
              {item.description && <p className="mt-1.5 text-base leading-relaxed text-niebla">{item.description}</p>}
              {!item.is_available && <span className="etiqueta mt-2 inline-block text-grafiti">Agotado por hoy</span>}
            </div>
            {item.image_url && (
              <img src={item.image_url} alt="" loading="lazy" width={112} height={112} className={`size-24 shrink-0 rounded-xl object-cover sm:size-28 ${item.is_available ? '' : 'opacity-50 grayscale'}`} />
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
