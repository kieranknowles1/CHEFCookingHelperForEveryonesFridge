import React from 'react'

import { IngredientPicker } from '../../components/IngredientPicker'
import UserContext from '../../contexts/UserContext'
import apiClient, { createAuthHeaders } from '../../apiClient'
import { type components } from '../../types/api.generated'

type Ingredient = components['schemas']['Ingredient']

export interface AddIngredientProps {
  currentIngredients: Ingredient[]
  onSubmit: (newItem: Ingredient, amount: number) => void
}

export default function AddIngredient (props: AddIngredientProps): React.JSX.Element {
  const currentIngredientIds = new Set(props.currentIngredients.map(i => i.id))

  const context = React.useContext(UserContext)

  const [selected, setSelected] = React.useState<Ingredient | null>(null)
  const [amount, setAmount] = React.useState(0)

  if (context === null) {
    throw new Error('UserContext is null')
  }

  const onSubmit = (event: React.FormEvent): void => {
    event.preventDefault()

    if (context.fridge === undefined) {
      alert('Please select a fridge.')
      return
    }

    if (selected === null) {
      alert('Please select an ingredient.')
      return
    }
    if (isNaN(amount)) {
      alert('Please input a number for the amount')
      return
    }

    apiClient.POST(
      '/fridge/{fridgeId}/ingredient/{ingredientId}/amount',
      {
        params: { path: { fridgeId: context.fridge.id, ingredientId: selected.id }, query: { amount } },
        headers: createAuthHeaders(context)
      }
    ).then(() => {
      props.onSubmit(selected, amount)
    }).catch(err => {
      console.error(err)
      alert('Failed to add ingredient.')
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <label>Ingredient: <IngredientPicker
        excludedIds={currentIngredientIds}
        selected={selected}
        setSelected={setSelected}
      /></label><br />

      <label>Amount: <input
        type='number'
        min={0}
        onChange={event => { setAmount(Number.parseFloat(event.target.value)) }}
        className='w-1/2'
        required
      /></label><br />

      <button type='submit' className='bg-savoy_blue-400 rounded'>Submit</button>
    </form>
  )
}
