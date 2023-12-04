import React from 'react'

import UserContext from '../UserContext'
import apiClient from '../apiClient'
import useSafeContext from '../useSafeContext'

export interface EditIngredientAmountProps {
  ingredientId: number
  currentAmount: number
  setCurrentAmount: React.Dispatch<number>
}

export default function EditIngredientAmount (props: EditIngredientAmountProps): React.JSX.Element {
  const context = useSafeContext(UserContext)

  const [deltaAmount, setDeltaAmount] = React.useState(0)

  function onSubmit (event: React.FormEvent): void {
    event.preventDefault()
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
    }).catch(err => {
      console.error(err)
      alert('Failed to update ingredient amount.')
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <label>Amount: <input
        value={deltaAmount}
        onChange={event => { setDeltaAmount(Number.parseFloat(event.target.value)) }}
        type='number'
        autoFocus
        className='w-1/2 bg-raisin_black-800 text-citron-100'
      /></label>
      <button className='w-full bg-savoy_blue-500 rounded' type='submit'>Submit</button>
    </form>
  )
}
