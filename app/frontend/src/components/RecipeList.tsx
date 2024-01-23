import React from 'react'
import { TbFridgeOff } from 'react-icons/tb'

import Recipe, { type RecipeProps } from './Recipe'
import { type LoadingStatus } from './LoadingSpinner'

export interface RecipeListProps {
  recipes: RecipeProps[]
  /**
   * If done and no recipes are found, display a message. Does not render a spinner.
   */
  status: LoadingStatus
}

/**
 * Component for displaying a list of recipes
 */
export default function RecipeList (props: RecipeListProps): React.JSX.Element {
  if (props.status === 'done' && props.recipes.length === 0) {
    return (
      <p className='text-center text-xl'>
        <TbFridgeOff className='inline' /> No recipes found
      </p>
    )
  } else {
    return (
      <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {props.recipes.map(recipe => <Recipe key={recipe.id} {...recipe} />)}
      </ul>
    )
  }
}
