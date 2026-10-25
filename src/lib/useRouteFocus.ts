import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Al llegar a una página navegando dentro del sitio, el foco pasa al contenido principal
 * para que los lectores de pantalla anuncien la página nueva. En la primera carga no se toca.
 */
export function useRouteFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const { key } = useLocation()
  useEffect(() => {
    if (key !== 'default') ref.current?.focus({ preventScroll: true })
  }, [key])
  return ref
}
