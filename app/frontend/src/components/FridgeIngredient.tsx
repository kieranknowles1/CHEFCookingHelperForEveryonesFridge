import React from 'react'

import { type components } from '../types/api.generated'
import formatAmount from '../formatAmount'

export type FridgeIngredientProps = components['schemas']['FridgeIngredientEntry']

/**
 * A representation of an ingredient in a user's fridge
 */
export default function FridgeIngredient (props: FridgeIngredientProps): React.JSX.Element {
  return (
    <li className='bg-raisin_black-400 text-center'>
      <h2>{props.ingredient.name}</h2>
      <p>{formatAmount(props.amount, props.ingredient.preferredUnit)}</p>
      <div className='p-1'>
        {/* TODO: OnClick bring up menu to specify amount and submit */}
        <button className='w-1/2 bg-raisin_black-600 text-citron-700'>Add</button>
        <button className='w-1/2 bg-raisin_black-700 text-citron-700'>Remove</button>
      </div>
    </li>
  )
}
