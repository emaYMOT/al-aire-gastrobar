import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Field, TextArea, TextInput } from '../../components/Field'
import ImageUpload from '../../components/ImageUpload'
import { Button } from '../../components/Modal'
import { store } from '../../lib/store'
import type { SiteSettings } from '../../lib/types'
import { PageTitle } from './AdminApp'

export default function ProfileEditor() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState<SiteSettings | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    store.getSettings().then((s) => {
      setSettings(s)
      setSaved(s)
    }, (e: Error) => toast.error(e.message))
  }, [])

  if (!settings) return null
  const set = (fields: Partial<SiteSettings>) => setSettings((s) => (s ? { ...s, ...fields } : s))
  const dirty = JSON.stringify(settings) !== JSON.stringify(saved)

  async function submit() {
    if (!settings) return
    if (!settings.name.trim()) {
      toast.error('Escribe el nombre del restaurante.')
      return
    }
    setBusy(true)
    try {
      await store.updateSettings(settings)
      setSaved(settings)
      toast.success('Perfil guardado')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageTitle title="Perfil" description="La foto, el nombre y el texto que aparecen arriba de los botones." />

      <div className="space-y-6 rounded-3xl border border-linea bg-white p-5 sm:p-7">
        <div>
          <span className="mb-2 block font-medium">Foto de perfil</span>
          <ImageUpload round folder="avatar" value={settings.avatar_url} onChange={(url) => set({ avatar_url: url })} />
        </div>
        <Field label="Nombre">
          <TextInput value={settings.name} onChange={(e) => set({ name: e.target.value })} maxLength={50} />
        </Field>
        <Field label="Descripción" hint="Puedes usar varias líneas. Lo ideal: dos o tres frases cortas.">
          <TextArea rows={4} value={settings.description} onChange={(e) => set({ description: e.target.value })} maxLength={280} />
        </Field>
        <div className="flex items-center justify-end gap-3">
          {dirty && <span className="text-sm text-gris">Tienes cambios sin guardar</span>}
          <Button onClick={submit} busy={busy} disabled={!dirty}>Guardar perfil</Button>
        </div>
      </div>

      <p className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm text-gris">
        El video de fondo se cambia en el repositorio de GitHub, reemplazando el archivo <code className="rounded bg-papel px-1.5 py-0.5 text-tinta">public/media/hero.mp4</code>. Los pasos están en el README.
      </p>
    </>
  )
}
