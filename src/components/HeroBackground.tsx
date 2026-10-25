import { useMemo, useState } from 'react'

const base = import.meta.env.BASE_URL

/**
 * Video de fondo compartido por el inicio y la carta (vive en el layout, así no se reinicia al navegar).
 * Video de fondo (public/media/hero.mp4 y hero.webm). Mientras carga, o si todavía
 * no se ha subido, se ve la ladera de noche con las luces de las casas.
 */
export default function HeroBackground({ dim = false }: { dim?: boolean }) {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-noche" aria-hidden>
      <Ladera />
      {!failed && (
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={`${base}media/hero-poster.jpg`}
          onPlaying={() => setReady(true)}
        >
          <source src={`${base}media/hero.webm`} type="video/webm" />
          <source src={`${base}media/hero.mp4`} type="video/mp4" onError={() => setFailed(true)} />
        </video>
      )}
      {/* Tinte cálido sobre el video, como luz de lámpara. */}
      <div className="absolute inset-0 bg-[#3a1d0c]/25 mix-blend-multiply" />
      {/* Viñeta: los bordes se hunden en negro y la luz queda arriba a la derecha. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_78%_10%,transparent_0%,rgba(17,13,10,.45)_55%,rgba(17,13,10,.85)_100%)]" />
      {/* Abajo, donde va el texto, se oscurece del todo para que se lea. */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-noche/35 via-50% to-noche/75" />
      {/* En la carta, una capa más oscura para leer platos y precios; se funde al cambiar de página. */}
      <div className={`absolute inset-0 bg-noche/60 transition-opacity duration-700 ease-out ${dim ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}

function Ladera() {
  const lights = useMemo(() => {
    let seed = 13
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    return Array.from({ length: 170 }, () => {
      const x = rand() * 100
      // Más casas abajo y hacia los lados, como la montaña.
      const ridge = 52 + Math.sin(x / 14) * 7 + Math.abs(x - 50) * -0.12
      const y = ridge + rand() * (100 - ridge)
      return { x, y, r: 0.08 + rand() * 0.22, d: 3 + rand() * 5, delay: rand() * -6, warm: rand() > 0.15 }
    })
  }, [])

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a120c" />
          <stop offset="0.5" stopColor="#2c1c11" />
          <stop offset="1" stopColor="#110d0a" />
        </linearGradient>
        <radialGradient id="lampara" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f0a066" stopOpacity="0.7" />
          <stop offset="0.45" stopColor="#b8642f" stopOpacity="0.3" />
          <stop offset="1" stopColor="#b8642f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="brillo">
          <stop offset="0" stopColor="#d97a42" stopOpacity="0.3" />
          <stop offset="1" stopColor="#d97a42" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#cielo)" />
      <ellipse cx="84" cy="6" rx="62" ry="44" fill="url(#lampara)" />
      <ellipse cx="50" cy="80" rx="70" ry="24" fill="url(#brillo)" />
      <path d="M0 58 C 14 48, 26 52, 38 46 S 62 44, 74 50 S 92 46, 100 52 L100 100 L0 100Z" fill="#140f0b" />
      {lights.map((l, i) => (
        <circle
          key={i}
          className="luz"
          cx={l.x}
          cy={l.y}
          r={l.r}
          fill={l.warm ? '#f0a066' : '#f2eadf'}
          style={{ ['--d' as string]: `${l.d}s`, ['--delay' as string]: `${l.delay}s` }}
        />
      ))}
    </svg>
  )
}
