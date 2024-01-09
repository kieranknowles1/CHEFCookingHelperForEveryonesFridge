import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import { type RecipeProps } from '../components/Recipe'
import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import monitorStatus from '../utils/monitorStatus'
import useSafeContext from '../contexts/useSafeContext'

import RecipeList from './RecipeList'

export interface SimilarRecipeProps {
  recipeName: string
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
      '/recipe/search',
      {
        params: {
          query: { limit: props.limit, minSimilarity: props.minSimilarity, availableForFridge, search: props.recipeName }
        }
      }
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      setRecipes(data)
    }).catch(err => {
      console.error(err)
    })
  }, [props.recipeName, props.limit, props.minSimilarity, props.onlyAvailable, context.fridgeId])

  return (
    <div>
      <LoadingSpinner status={status} />
      <RecipeList recipes={recipes} status={status} />
    </div>
  )
}
