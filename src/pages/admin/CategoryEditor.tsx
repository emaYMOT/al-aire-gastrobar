import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Field, focusFirstInvalid, TextArea, TextInput } from '../../components/Field'
import ImageUpload from '../../components/ImageUpload'
import Modal, { Button, CancelButton, ConfirmDialog } from '../../components/Modal'
import SortableList, { MoveControls, moveInList, RowAction } from '../../components/SortableList'
import Toggle, { Switch } from '../../components/Toggle'
import { formatPrice, parsePrice } from '../../lib/format'
import type { Category, Draft, MenuItem } from '../../lib/types'
import { EmptyState } from './AdminApp'
import { CategoryForm } from './MenuEditor'
import { useAdminList } from './useAdminList'

export default function CategoryEditor() {
  const { categoryId } = useParams()
  const categories = useAdminList('menu_categories')
  const items = useAdminList('menu_items')
  const [editing, setEditing] = useState<Draft<MenuItem> | null>(null)
  const [deleting, setDeleting] = useState<MenuItem | null>(null)
  const [editingCategory, setEditingCategory] = useState(false)

  const category = categories.rows?.find((c) => c.id === categoryId)
  const list = items.rows?.filter((i) => i.category_id === categoryId) ?? null

  if (categories.rows && !category) {
    return (
      <EmptyState>
        Esta categoría ya no existe. <Link to="/admin/carta" className="font-semibold text-tinta underline">Volver a la carta</Link>
      </EmptyState>
    )
  }

  const blank: Draft<MenuItem> = { category_id: categoryId!, name: '', description: '', price: 0, image_url: null, is_available: true, is_active: true }

  return (
    <>
      <Link to="/admin/carta" className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-gris hover:text-tinta">
        <ChevronLeft size={18} /> Todas las categorías
      </Link>

      <div className="mt-2 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 font-display text-[2rem] leading-tight">
            {category?.emoji && <span aria-hidden>{category.emoji}</span>}
            <span className="truncate">{category?.name ?? ' '}</span>
          </h1>
          <button type="button" onClick={() => setEditingCategory(true)} className="mt-1 -ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-gris transition-colors hover:bg-white hover:text-tinta">
            <Pencil size={14} /> Editar nombre y descripción
          </button>
        </div>
        <Button onClick={() => setEditing(blank)}><Plus size={19} /> Agregar plato</Button>
      </div>

      {list && list.length === 0 && <EmptyState>Esta categoría no tiene platos. Mientras esté vacía no aparece en la carta.</EmptyState>}

      {list && (
        <SortableList
          items={list}
          onReorder={items.reorder}
          renderItem={(item) => (
            <>
              <button type="button" onClick={() => setEditing(item)} title={item.name} className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1 text-left transition-colors hover:bg-papel">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="size-12 shrink-0 rounded-xl bg-papel" />
                )}
                <span className="min-w-0 flex-1">
                  <span className={`block line-clamp-2 leading-snug font-semibold [overflow-wrap:anywhere] ${item.is_active ? '' : 'text-gris line-through decoration-1'}`}>{item.name}</span>
                  <span className="flex flex-wrap items-center gap-x-2 text-sm text-gris">
                    <span className="tabular-nums">{formatPrice(item.price)}</span>
                    {!item.is_available && <span className="rounded-full bg-peligro/10 px-2 text-xs font-semibold text-peligro">Agotado</span>}
                    {!item.is_active && <span className="text-xs">Oculto</span>}
                  </span>
                </span>
              </button>
              <Switch small checked={item.is_active} onChange={(v) => items.patch(item.id, { is_active: v }, v ? 'Plato visible' : 'Plato oculto')} label={item.is_active ? 'Visible. Toca para ocultar' : 'Oculto. Toca para mostrar'} />
              <RowAction label="Editar plato" onClick={() => setEditing(item)}><Pencil size={18} /></RowAction>
            </>
          )}
        />
      )}

      {editing && categories.rows && (
        <ItemForm
          initial={editing}
          categories={categories.rows}
          onDelete={editing.id ? () => { setDeleting(editing as MenuItem); setEditing(null) } : undefined}
          move={editing.id && list ? {
            index: list.findIndex((r) => r.id === editing.id),
            total: list.length,
            onMove: (direction) => {
              const next = moveInList(list, editing.id!, direction)
              if (next) items.reorder(next)
            },
          } : undefined}
          onClose={() => setEditing(null)}
          onSave={async (draft) => {
            await items.save(draft, draft.id ? 'Plato guardado' : 'Plato agregado')
            setEditing(null)
          }}
        />
      )}

      {editingCategory && category && (
        <CategoryForm
          initial={category}
          onClose={() => setEditingCategory(false)}
          onSave={async (draft) => {
            await categories.save(draft, 'Categoría guardada')
            setEditingCategory(false)
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="¿Eliminar este plato?"
        message={`"${deleting?.name}" se borrará de la carta. Si solo se acabó por hoy, márcalo como agotado.`}
        confirmLabel="Eliminar plato"
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) items.remove(deleting.id, 'Plato eliminado')
          setDeleting(null)
        }}
      />
    </>
  )
}

function ItemForm({ initial, categories, onSave, onClose, onDelete, move }: {
  initial: Draft<MenuItem>
  categories: Category[]
  onSave: (draft: Draft<MenuItem>) => Promise<void>
  onClose: () => void
  onDelete?: () => void
  move?: { index: number; total: number; onMove: (direction: -1 | 1) => void }
}) {
  const [draft, setDraft] = useState(initial)
  const [priceText, setPriceText] = useState(initial.price ? formatPrice(initial.price).slice(1) : '')
  const [busy, setBusy] = useState(false)
  const [tried, setTried] = useState(false)
  const set = (fields: Partial<Draft<MenuItem>>) => setDraft((d) => ({ ...d, ...fields }))

  const nameError = draft.name.trim() ? '' : 'Escribe el nombre del plato.'
  const priceError = draft.price > 0 ? '' : 'Escribe el precio.'

  function changePrice(text: string) {
    const value = parsePrice(text)
    setPriceText(value ? formatPrice(value).slice(1) : '')
    set({ price: value })
  }

  async function submit() {
    setTried(true)
    if (nameError || priceError) {
      focusFirstInvalid()
      return
    }
    setBusy(true)
    try {
      await onSave({ ...draft, name: draft.name.trim(), description: draft.description?.trim() || null })
    } catch {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      dirty={JSON.stringify(draft) !== JSON.stringify(initial)}
      title={initial.id ? 'Editar plato' : 'Nuevo plato'}
      onClose={onClose}
      footer={
        <>
          {onDelete && (
            <Button variant="ghost" className="text-peligro hover:bg-peligro/8 sm:mr-auto" onClick={onDelete}>
              <Trash2 size={18} /> Eliminar plato
            </Button>
          )}
          <CancelButton />
          <Button onClick={submit} busy={busy}>{initial.id ? 'Guardar cambios' : 'Agregar plato'}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Nombre" error={tried ? nameError : ''}>
          <TextInput value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Chicharrón al aire" maxLength={70} />
        </Field>
        <Field label="Descripción (opcional)" hint="Ingredientes o cómo se sirve.">
          <TextArea value={draft.description ?? ''} onChange={(e) => set({ description: e.target.value })} maxLength={240} />
        </Field>
        <Field label="Precio" prefix="$" error={tried ? priceError : ''}>
          <TextInput value={priceText} onChange={(e) => changePrice(e.target.value)} inputMode="numeric" placeholder="25.000" className="pl-8 tabular-nums" />
        </Field>
        <div>
          <span className="mb-1.5 block font-medium">Foto (opcional)</span>
          <ImageUpload folder="items" value={draft.image_url} onChange={(url) => set({ image_url: url })} />
        </div>
        <div className="divide-y divide-linea rounded-2xl border border-linea px-4">
          <Toggle label="Disponible hoy" description="Apágalo cuando se acabe: se verá como agotado." checked={draft.is_available} onChange={(v) => set({ is_available: v })} />
          <Toggle label="Mostrar en la carta" description="Apágalo para esconderlo sin borrarlo." checked={draft.is_active} onChange={(v) => set({ is_active: v })} />
        </div>
        {categories.length > 1 && (
          <Field label="Categoría">
            <select
              value={draft.category_id}
              onChange={(e) => set({ category_id: e.target.value })}
              className="w-full rounded-xl border border-linea bg-white px-4 py-3 text-base focus:border-tinta focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        )}
        {move && <MoveControls {...move} />}
      </div>
    </Modal>
  )
}
