import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import { type RecipeProps } from '../components/Recipe'
import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import monitorStatus from '../utils/monitorStatus'
import useSafeContext from '../contexts/useSafeContext'

import RecipeList from './RecipeList'

export interface SimilarRecipeProps {
  recipeId: number
  limit: number
  minSimilarity: number
  onlyAvailable: boolean
}

export default function SimilarRecipes (props: SimilarRecipeProps): React.JSX.Element {
  const context = useSafeContext(UserContext)

  const [recipes, setRecipes] = React.useState<RecipeProps[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    setRecipes([])
    const availableForFridge = props.onlyAvailable ? context.fridgeId : undefined
    apiClient.GET(
      '/recipe/{recipeId}/similar',
      {
        params: {
          path: { recipeId: props.recipeId },
          query: { limit: props.limit, minSimilarity: props.minSimilarity, availableForFridge }
        }
      }
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      setRecipes(data)
    }).catch(err => {
      console.error(err)
    })
  }, [props.recipeId, props.limit, props.minSimilarity, props.onlyAvailable, context.fridgeId])

  return (
    <div>
      <LoadingSpinner status={status} />
      <RecipeList recipes={recipes} />
    </div>
  )
}
