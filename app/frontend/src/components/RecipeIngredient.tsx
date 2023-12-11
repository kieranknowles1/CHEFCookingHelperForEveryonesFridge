import React from 'react'

import { type components } from '../types/api.generated'
import formatAmount from '../formatAmount'

type Ingredient = components['schemas']['Ingredient']

export interface RecipeIngredientProps {
  ingredient: Ingredient
  amount?: number
  originalLine?: string
}

export default function RecipeIngredient (props: RecipeIngredientProps): React.JSX.Element {
  return (
    <li>
      {props.amount !== undefined && formatAmount(props.amount, props.ingredient.preferredUnit)} {props.ingredient.name}
    </li>
  )
}
