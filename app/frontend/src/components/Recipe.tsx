import { Link } from 'react-router-dom'
import React from 'react'

import formatPercentage from '../utils/formatPercentage'

export interface RecipeProps {
  id: number
  name: string
  missingIngredientAmount?: number
  similarity?: number
}

export default function Recipe (props: RecipeProps): React.JSX.Element {
  const missingAmount = props.missingIngredientAmount ?? 0
  const similarity = props.similarity ?? undefined
  return (
    <Link to={`/recipe/${props.id}`} className='bg-raisin_black-600 rounded p-1'>
      <li>
        <span className='float-left'>{props.name}</span>
        {missingAmount > 0 && <span className='float-right text-red-500'>{props.missingIngredientAmount} missing ingredients.</span>}
        {similarity !== undefined && <span className='float-right text-green-500'>Similarity: {formatPercentage(similarity)}</span>}
      </li>
    </Link>
  )
}
