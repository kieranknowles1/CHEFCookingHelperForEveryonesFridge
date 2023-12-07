import React from 'react'

import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import useSafeContext from '../contexts/useSafeContext'

export interface EditIngredientAmountProps {
  ingredientId: number
  currentAmount: number
  setCurrentAmount: React.Dispatch<number>
  // Callback for when the form has successfully been submitted
  onSubmit: () => void
}

export default function EditIngredientAmount (props: EditIngredientAmountProps): React.JSX.Element {
  const context = useSafeContext(UserContext)

  const [deltaAmount, setDeltaAmount] = React.useState(0)

  function onSubmit (event: React.FormEvent): void {
    event.preventDefault()
    // TODO: Handle removing ingredients. Probably want 2 popovers 1 for each action
    const newAmount = props.currentAmount + deltaAmount
    const params = {
      path: { fridgeId: context.fridgeId, ingredientId: props.ingredientId },
      query: { amount: newAmount }
    }

    apiClient.POST(
      '/fridge/{fridgeId}/ingredient/{ingredientId}/amount',
      { params }
    ).then(() => {
      props.setCurrentAmount(newAmount)
      props.onSubmit()
    }).catch(err => {
      console.error(err)
      alert('Failed to update ingredient amount.')
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <label>Amount: <input
        type='number'
        min={0}
        onChange={event => { setDeltaAmount(Number.parseFloat(event.target.value)) }}
        autoFocus
        className='w-1/2'
        required
      /></label>
      <button className='w-full bg-savoy_blue-500 rounded' type='submit'>Submit</button>
    </form>
  )
}
