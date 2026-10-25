import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import type { ReactNode } from 'react'

/** Lista que se reordena arrastrando la manija (mouse, dedo o teclado). */
export default function SortableList<T extends { id: string }>({ items, onReorder, renderItem }: {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T) => ReactNode
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.id === active.id)
    const to = items.findIndex((i) => i.id === over.id)
    onReorder(arrayMove(items, from, to))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-1 rounded-2xl border bg-white py-2 pr-2 pl-1 ${isDragging ? 'relative z-10 border-tinta/30 shadow-xl' : 'border-linea'}`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="grid h-12 w-11 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-gris hover:bg-papel active:cursor-grabbing"
        aria-label="Arrastra para cambiar el orden"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>
      {children}
    </li>
  )
}

/** Mueve un elemento una posición; devuelve null si ya está en el borde. */
export function moveInList<T extends { id: string }>(list: T[], id: string, direction: -1 | 1): T[] | null {
  const from = list.findIndex((r) => r.id === id)
  const to = from + direction
  if (from < 0 || to < 0 || to >= list.length) return null
  return arrayMove(list, from, to)
}

/** Alternativa a arrastrar: subir o bajar con un toque (también sirve con teclado). */
export function MoveControls({ index, total, onMove }: { index: number; total: number; onMove: (direction: -1 | 1) => void }) {
  if (index < 0 || total < 2) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-linea px-4 py-2">
      <span className="text-sm text-gris">
        Posición {index + 1} de {total}
      </span>
      <div className="flex gap-1">
        <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-papel disabled:opacity-40">
          <ArrowUp size={16} aria-hidden /> Subir
        </button>
        <button type="button" disabled={index === total - 1} onClick={() => onMove(1)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-papel disabled:opacity-40">
          <ArrowDown size={16} aria-hidden /> Bajar
        </button>
      </div>
    </div>
  )
}

/** Botones de acción de cada fila (editar / eliminar). */
export function RowAction({ label, onClick, children, danger }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-11 shrink-0 place-items-center rounded-xl transition ${danger ? 'text-gris hover:bg-peligro/8 hover:text-peligro' : 'text-tinta hover:bg-papel'}`}
    >
      {children}
    </button>
  )
}
