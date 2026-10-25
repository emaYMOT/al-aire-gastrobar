import { useState, type FormEvent } from 'react'
import { Field, TextInput } from '../../components/Field'
import { Button } from '../../components/Modal'
import { store, type AdminSession } from '../../lib/store'

export default function Login({ onSignedIn }: { onSignedIn: (session: AdminSession) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const demo = store.mode === 'demo'

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await store.signIn(email.trim(), password)
      const session = await store.getSession()
      if (session) onSignedIn(session)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-linea bg-white p-7 shadow-sm">
        <p className="font-display text-3xl">al aire</p>
        <h1 className="mt-1 text-gris">Entra para editar la página y la carta.</h1>

        {demo ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl bg-cobre/12 px-4 py-3 text-sm">
              La web todavía no está conectada a Supabase. Puedes probar el panel en modo demo: los cambios se guardan solo en este navegador.
            </p>
            <Button type="submit" className="w-full" busy={busy} busyLabel="Entrando…">Entrar al modo demo</Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <Field label="Correo">
              <TextInput type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Contraseña">
              <TextInput type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <label className="-mt-2 flex min-h-11 items-center gap-2.5 text-sm text-gris">
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="size-4.5 accent-tinta" />
              Mostrar contraseña
            </label>
            {error && <p className="text-sm text-peligro" role="alert">{error}</p>}
            <Button type="submit" className="w-full" busy={busy} busyLabel="Entrando…">Entrar</Button>
          </div>
        )}
      </form>
    </main>
  )
}
