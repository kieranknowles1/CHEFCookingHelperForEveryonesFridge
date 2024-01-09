import { Popover } from '@headlessui/react'
import React from 'react'

import { type components } from '../types/api.generated'
import formatAmount from '../formatAmount'

import EditIngredientAmount from './EditIngredientAmount'
import createPopper from './createPopper'

type Ingredient = components['schemas']['Ingredient']

export interface FridgeIngredientProps {
  ingredient: Ingredient
  amount: number
  onEditAmount: (newAmount: number) => void
}

/**
 * A representation of an ingredient in a user's fridge
 */
export default function FridgeIngredient (props: FridgeIngredientProps): React.JSX.Element {
  const [amount, setAmount] = React.useState(props.amount)

  const popData = createPopper()

  return (
    <Popover>
      <div className='bg-raisin_black-400 text-center rounded-2xl'>
        <h2>{props.ingredient.name}</h2>
        <p>{formatAmount(amount, props.ingredient.preferredUnit)}</p>
        <br />
        <Popover.Button
          className='w-full bg-raisin_black-600 text-citron-700 rounded'
          ref={popData.setReferenceElement}
        >
          Add/Remove
        </Popover.Button>
      </div>
      <Popover.Panel
        className='bg-raisin_black-700 text-citron rounded-xl'
        style={popData.styles.popper}
        ref={popData.setPopperElement}
        {...popData.attributes.popper}
      >
        {({ close }) => (
          <EditIngredientAmount
            ingredientId={props.ingredient.id}
            currentAmount={amount}
            setCurrentAmount={setAmount}
            onCancel={close}
            onSubmit={() => {
              close()
              props.onEditAmount(amount)
            }}
          />
        )}
      </Popover.Panel>
    </Popover>
  )
}
