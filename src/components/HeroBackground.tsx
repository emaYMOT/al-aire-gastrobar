import { useMemo, useState, type CSSProperties } from 'react'

const base = import.meta.env.BASE_URL

const vars = (v: Record<string, string | number>) => v as CSSProperties

/**
 * Fondo compartido por el inicio y la carta (vive en el layout, así no se reinicia al navegar).
 * Video de fondo (public/media/hero.mp4 y hero.webm). Mientras carga, o si falla,
 * se ven las brasas: chispas que suben desde abajo y se apagan, sobre un resplandor cobre.
 */
export default function HeroBackground({ dim = false }: { dim?: boolean }) {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  // Posiciones "al azar" pero siempre iguales en cada visita.
  const chispas = useMemo(() => {
    let s = 5
    const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    return Array.from({ length: 56 }, () => ({ x: rand() * 100, t: 2.5 + rand() * 4.5, d: 6 + rand() * 9, delay: rand() * -15, dx: (rand() - 0.5) * 80 }))
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-noche" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(90%_55%_at_50%_100%,color-mix(in_oklab,var(--color-cobre)_35%,transparent),transparent_70%),linear-gradient(180deg,var(--color-noche),var(--color-noche-2))]">
        {chispas.map((c, i) => (
          <span
            key={i}
            className="columna brasa"
            style={vars({ left: `${c.x}%`, '--t': `${c.t}px`, '--d': `${c.d}s`, '--delay': `${c.delay}s`, '--dx': `${c.dx}px`, '--anim': 'subir-columna' })}
          >
            <i />
          </span>
        ))}
      </div>
      {!failed && (
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setReady(true)}
        >
          <source src={`${base}media/hero.webm`} type="video/webm" />
          <source src={`${base}media/hero.mp4`} type="video/mp4" onError={() => setFailed(true)} />
        </video>
      )}
      {/* Tinte cálido sobre el video, como luz de lámpara. */}
      <div className="absolute inset-0 bg-[#3a1d0c]/5 mix-blend-multiply" />
      {/* Viñeta: los bordes se hunden en negro y la luz queda arriba a la derecha. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_78%_10%,transparent_0%,rgba(17,13,10,.45)_55%,rgba(17,13,10,.85)_100%)]" />
      {/* Abajo, donde va el texto, se oscurece del todo para que se lea. */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-noche/[17.5%] via-50% to-noche/[37.5%]" />
      {/* En la carta, una capa más oscura para leer platos y precios; se funde al cambiar de página. */}
      <div className={`absolute inset-0 bg-noche/30 transition-opacity duration-700 ease-out ${dim ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}
