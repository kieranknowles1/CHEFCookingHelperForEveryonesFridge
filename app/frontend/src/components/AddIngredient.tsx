import React from 'react'

// TODO: Implement
export default function AddIngredient (): React.JSX.Element {
  function onSubmit (event: React.FormEvent): void {
    event.preventDefault()
  }
  return (
    <form onSubmit={onSubmit}>
      <button type='submit'>Add</button>
    </form>
  )
}
