import React from 'react'

import { type components } from '../types/api.generated'
import formatAmount from '../formatAmount'

type Ingredient = components['schemas']['Ingredient']

export interface RecipeIngredientProps {
  ingredient: Ingredient
  amount?: number
  originalLine?: string
  // 0 means the ingredient is not available
  availableAmount: number | 'nologin'
}

function getAvailableAmountElement (availableAmount: number | 'nologin', amount: number | null, ingredient: Ingredient): React.JSX.Element | undefined {
  // This ingredient doesn't have an amount, the user is not logged in, or the ingredient is assumed to be unlimited (i.e., water)
  if (amount === null || availableAmount === 'nologin' || ingredient.assumeUnlimited) {
    return undefined
  }

  const style = amount > availableAmount ? 'text-red-500' : 'text-green-500'

  return (
    <span className={style}>
      (have {formatAmount(availableAmount, ingredient.preferredUnit)})
    </span>
  )
}

export default function RecipeIngredient (props: RecipeIngredientProps): React.JSX.Element {
  const amount = props.amount !== undefined ? formatAmount(props.amount, props.ingredient.preferredUnit) : undefined

  return (
    <li>
      {amount} {props.ingredient.name} {getAvailableAmountElement(props.availableAmount, props.amount ?? null, props.ingredient)}
    </li>
  )
}
