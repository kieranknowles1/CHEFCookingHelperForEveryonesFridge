import { Popover } from '@headlessui/react'
import React from 'react'

import { type components } from '../types/api.generated'
import formatAmount from '../formatAmount'

import EditIngredientAmount from './EditIngredientAmount'

export type FridgeIngredientProps = components['schemas']['FridgeIngredientEntry']

/**
 * A representation of an ingredient in a user's fridge
 */
export default function FridgeIngredient (props: FridgeIngredientProps): React.JSX.Element {
  const [amount, setAmount] = React.useState(props.amount)

  return (
    <Popover>
      <div className='bg-raisin_black-400 text-center rounded-2xl'>
        <h2>{props.ingredient.name}</h2>
        <p>{formatAmount(amount, props.ingredient.preferredUnit)}</p>
        <br />
        <Popover.Button className='w-full bg-raisin_black-600 text-citron-700 rounded'>Add/Remove</Popover.Button>
      </div>
      <Popover.Panel className='bg-raisin_black-700 text-citron rounded-xl'>
        <EditIngredientAmount
          ingredientId={props.ingredient.id}
          currentAmount={amount}
          setCurrentAmount={setAmount}
        />
      </Popover.Panel>
    </Popover>
  )
}
