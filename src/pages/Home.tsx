import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { LinkIcon } from '../lib/icons'
import { bySort } from '../lib/format'
import { store } from '../lib/store'
import { useCached } from '../lib/useCached'

async function loadHome() {
  const [settings, links] = await Promise.all([store.getSettings(), store.list('links')])
  return { settings, links: links.filter((l) => l.is_active).sort(bySort) }
}

export default function Home() {
  const { data, error } = useCached('home', loadHome)

  // Vidrio esmerilado: fondo translúcido que desenfoca el video detrás, con un brillo fino arriba.
  const button =
    'vidrio flex min-h-14 w-full items-center gap-3.5 rounded-full border px-6 py-3.5 text-[1.0625rem] font-medium text-cal transition-[background-color,border-color,box-shadow,transform] duration-200 active:scale-[.98]'

  return (
    <main className="relative flex min-h-dvh flex-col">

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-end px-5 pt-24 pb-[max(2rem,env(safe-area-inset-bottom))] sm:justify-center sm:pb-16">
        {error && <p className="rounded-xl bg-noche-2/90 p-4 text-sm text-niebla">No pudimos cargar la página. Revisa tu conexión y vuelve a intentarlo.</p>}

        {data && (
          <>
            <header className="mb-8 flex flex-col items-center text-center">
              <div className="encender" style={{ ['--i' as string]: 0 }}>
                <Avatar src={data.settings.avatar_url} name={data.settings.name} />
              </div>
              <h1 className="encender mt-6 font-display text-[2.6rem] leading-[1.05] text-balance [text-shadow:0_2px_18px_rgba(17,13,10,.7)]" style={{ ['--i' as string]: 1 }}>
                {data.settings.name}
              </h1>
              <p className="encender mt-4 max-w-[36ch] text-base leading-relaxed whitespace-pre-line text-cal/85 text-pretty [text-shadow:0_1px_10px_rgba(17,13,10,.85)]" style={{ ['--i' as string]: 2 }}>
                {data.settings.description}
              </p>
            </header>

            <nav className="flex flex-col gap-3" aria-label="Enlaces">
              {data.links.map((link, index) => {
                const style = { ['--i' as string]: index + 3 }
                if (link.type === 'menu') {
                  return (
                    <Link
                      key={link.id}
                      to="/carta"
                      viewTransition
                      className={`${button} encender border-cobre/55 bg-cobre/30 shadow-[inset_0_1px_0_rgba(255,214,180,.35),0_12px_40px_-14px_rgba(217,122,66,.9)] hover:border-cobre/80 hover:bg-cobre/45`}
                      style={style}
                    >
                      <LinkIcon name={link.icon} size={22} className="text-cobre-2" />
                      <span className="flex-1">{link.label}</span>
                    </Link>
                  )
                }
                return (
                  <a
                    key={link.id}
                    href={link.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${button} encender border-white/15 bg-white/[.07] shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_10px_30px_-14px_rgba(0,0,0,.7)] hover:border-white/30 hover:bg-white/[.12]`}
                    style={style}
                  >
                    <LinkIcon name={link.icon} size={22} className="text-cobre" />
                    <span className="flex-1">{link.label}</span>
                  </a>
                )
              })}
            </nav>
          </>
        )}
      </div>
    </main>
  )
}
