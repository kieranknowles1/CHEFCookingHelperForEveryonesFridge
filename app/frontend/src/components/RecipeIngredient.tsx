import React from 'react'

import { type components } from '../types/api.generated'
import formatAmount from '../formatAmount'

type Ingredient = components['schemas']['Ingredient']
type Unit = components['schemas']['Unit']

export interface RecipeIngredientProps {
  ingredient: Ingredient
  amount?: number
  originalLine?: string
  // 0 means the ingredient is not available
  availableAmount: number | 'nologin'
}

function getAvailableAmountElement (availableAmount: number | 'nologin', amount?: number, unit: Unit): React.JSX.Element | undefined {
  // This ingredient doesn't have an amount, or the user is not logged in
  if (amount === undefined || availableAmount === 'nologin') {
    return undefined
  }

  const style = amount > availableAmount ? 'text-red-500' : 'text-green-500'

  return (
    <span className={style}>
      (have {formatAmount(availableAmount, unit)})
    </span>
  )
}

export default function RecipeIngredient (props: RecipeIngredientProps): React.JSX.Element {
  const amount = props.amount !== undefined ? formatAmount(props.amount, props.ingredient.preferredUnit) : undefined

  return (
    <li>
      {amount} {props.ingredient.name} {getAvailableAmountElement(props.availableAmount, props.amount, props.ingredient.preferredUnit)}
    </li>
  )
}
