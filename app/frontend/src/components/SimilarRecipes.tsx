import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import Recipe, { type RecipeProps } from '../components/Recipe'
import apiClient from '../apiClient'
import monitorStatus from '../utils/monitorStatus'

export interface SimilarRecipeProps {
  recipeId: number
  limit: number
  minSimilarity: number
}

export default function SimilarRecipes (props: SimilarRecipeProps): React.JSX.Element {
  const [recipes, setRecipes] = React.useState<RecipeProps[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    setRecipes([])
    apiClient.GET(
      '/recipe/{recipeId}/similar',
      {
        params: {
          path: { recipeId: props.recipeId },
          query: { limit: props.limit, minSimilarity: props.minSimilarity }
        }
      }
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      setRecipes(data)
    }).catch(err => {
      console.error(err)
    })
  }, [props.recipeId, props.limit, props.minSimilarity])

  // TODO: Show how much of each ingredient is available and highlight missing ones
  return (
    <div>
      <LoadingSpinner status={status} />
      {/* TODO: Recipe list component for here and available recipes page */}
      <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {recipes.map(recipe => <Recipe key={recipe.id} {...recipe} />)}
      </ul>
    </div>
  )
}
