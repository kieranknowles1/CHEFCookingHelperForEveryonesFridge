import React from 'react'

import apiClient from '../apiClient'

export interface EditIngredientAmountProps {
  ingredientId: number
}

export default function EditIngredientAmount (props: EditIngredientAmountProps): React.JSX.Element {
  function onSubmit (event: React.FormEvent): void {
    event.preventDefault()

    // TODO: Need a way to get fridge ID here
    // TODO: Get new amount
    // TODO: Update parent without refetching everything
    apiClient.POST(
      '/fridge/{fridgeId}/ingredient/{ingredientId}/amount',
      { params: { path: { fridgeId: 1, ingredientId: props.ingredientId }, query: { amount: 1234 } } }
    ).catch(err => {
      console.error(err)
      alert('Failed to update ingredient amount.')
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <label>Amount: <input
        type='number'
        autoFocus
        className='w-1/2 bg-raisin_black-800 text-citron-100'
      /></label>
      <button className='w-full bg-savoy_blue-500 rounded' type='submit'>Submit</button>
    </form>
  )
}
