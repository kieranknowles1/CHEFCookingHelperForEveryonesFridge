import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../../components/LoadingSpinner'
import RecipeList from '../../components/RecipeList'
import { type RecipeProps } from '../../components/Recipe'
import UserContext from '../../contexts/UserContext'
import apiClient from '../../apiClient'
import { type components } from '../../types/api.generated'
import monitorStatus from '../../utils/monitorStatus'
import useSafeContext from '../../contexts/useSafeContext'

type Recipe = components['schemas']['Recipe']

export interface SimilarRecipeProps {
  recipe: Recipe
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
          query: { limit: props.limit, minSimilarity: props.minSimilarity, availableForFridge, search: props.recipe.name }
        }
      }
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      setRecipes(data.filter(recipe => recipe.id !== props.recipe.id))
    }).catch(err => {
      console.error(err)
    })
  }, [props.recipe.name, props.limit, props.minSimilarity, props.onlyAvailable, context.fridgeId])

  return (
    <div>
      <LoadingSpinner status={status} />
      <RecipeList recipes={recipes} status={status} />
    </div>
  )
}
