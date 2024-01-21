import React from 'react'

import { IngredientPicker } from '../../components/IngredientPicker'
import { type components } from '../../types/api.generated'

type Ingredient = components['schemas']['Ingredient']

export interface AddBannedIngredientProps {
  currentBannedIngredients: Set<number>
  onSubmit: () => void
}

export default function AddBannedIngredient (props: AddBannedIngredientProps): React.JSX.Element {
  const [selected, setSelected] = React.useState<Ingredient | null>(null)

  function onSubmit (event: React.FormEvent): void {
    event.preventDefault()

    // TODO: Send post request and call props.onSubmit on success
    props.onSubmit()
  }

  return (
    <form onSubmit={onSubmit}>
      <label>Ingredient: <IngredientPicker
        excludedIds={props.currentBannedIngredients}
        selected={selected}
        setSelected={setSelected}
      /></label><br />

      <button type='submit' className='bg-savoy_blue-400'>Add</button>
    </form>
  )
}
