import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import Recipe, { type RecipeProps } from '../components/Recipe'
import apiClient from '../apiClient'
import { type paths } from '../types/api.generated'

export interface SimilarRecipeProps {
  recipeId: number,
  limit: number,
  minSimilarity: number,
}

export default function SimilarRecipes (props: SimilarRecipeProps): React.JSX.Element {
  const [recipes, setRecipes] = React.useState<RecipeProps[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    setStatus('loading')
    setRecipes([])
    apiClient.GET(
      '/recipe/{id}/similar',
      {
        params: {
          path: { id: props.recipeId },
          query: { limit: props.limit, minSimilarity: props.minSimilarity }
        }
      }
    ).then(response => {
      if (response.data === undefined) {
        console.error(response.error)
        setStatus('error')
        return
      }
      setRecipes(response.data)
      setStatus('done')
    }).catch(err => {
      console.error(err)
      setStatus('error')
    })
  }, [props.recipeId, props.limit, props.minSimilarity])

  // TODO: Show how much of each ingredient is available and highlight missing ones
  return (
    <div>
      <h2>Similar recipes that you can make</h2>
      <LoadingSpinner status={status} />
      {/* TODO: Recipe list component for here and available recipes page */}
      <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {recipes.map(recipe => <Recipe key={recipe.id} {...recipe} />)}
      </ul>
    </div>
  )
}
