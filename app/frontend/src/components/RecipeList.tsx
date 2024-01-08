import React from 'react'

import Recipe, { type RecipeProps } from './Recipe'

export interface RecipeListProps {
  recipes: RecipeProps[]
}

/**
 * Component for displaying a list of recipes
 */
export default function RecipeList (props: RecipeListProps): React.JSX.Element {
  return (
    <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {props.recipes.map(recipe => <Recipe key={recipe.id} {...recipe} />)}
    </ul>
  )
}
