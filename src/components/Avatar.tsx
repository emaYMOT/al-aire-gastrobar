export default function Avatar({ src, name, size = 104 }: { src: string | null; name: string; size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-noche-2 border border-cobre/60 shadow-[0_0_0_6px_rgba(17,13,10,.55),0_0_0_7px_rgba(217,122,66,.25),0_0_60px_-8px_rgba(217,122,66,.6)]"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center font-display text-[length:calc(var(--s)*0.26)] italic text-cal" style={{ ['--s' as string]: `${size}px` }}>
          al aire
        </div>
      )}
    </div>
  )
}
