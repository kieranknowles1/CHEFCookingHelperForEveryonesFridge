import React from 'react'
import { usePopper } from 'react-popper'

export interface PopperData {
  setReferenceElement: React.Dispatch<Element | null>
  setPopperElement: React.Dispatch<HTMLElement | null>
  styles: Record<string, React.CSSProperties>
  attributes: Record<string, Record<string, string> | undefined>
}

/**
 * Helper function to wrap a popper from `react-popper`
 *
 * Add `ref={setPopperElement} style={styles.popper} attributes={...attributes.popper}` to the popper
 *
 * Add `ref={setReferenceElement}` to the element the popper attaches to. The reference
 * element can be changed at runtime.
 *
 */
export default function createPopper (): PopperData {
  const [referenceElement, setReferenceElement] = React.useState<Element | null>()
  const [popperElement, setPopperElement] = React.useState<HTMLElement | null>()

  const { styles, attributes } = usePopper(referenceElement, popperElement)

  // TODO: Add an arrow

  return {
    setReferenceElement,
    setPopperElement,
    styles,
    attributes
  }
}
