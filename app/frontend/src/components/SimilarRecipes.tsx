import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import { type RecipeProps } from '../components/Recipe'
import apiClient from '../apiClient'
import monitorStatus from '../utils/monitorStatus'

import RecipeList from './RecipeList'

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

  return (
    <div>
      <LoadingSpinner status={status} />
      <RecipeList recipes={recipes} />
    </div>
  )
}
