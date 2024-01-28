import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../../components/LoadingSpinner'
import RecipeList from '../../components/RecipeList'
import { type RecipeProps } from '../../components/Recipe'
import { type SearchFilters } from '../../components/RecipeSearchOptions'
import UserContext from '../../contexts/UserContext'
import apiClient from '../../apiClient'
import { type components } from '../../types/api.generated'
import monitorOutcome from '../../utils/monitorOutcome'

type Recipe = components['schemas']['Recipe']

export interface SimilarRecipeProps {
  recipe: Recipe
  limit: number
  minSimilarity: number
  filters: SearchFilters
}

export default function SimilarRecipes (props: SimilarRecipeProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  const [recipes, setRecipes] = React.useState<RecipeProps[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    setRecipes([])
    apiClient.GET(
      '/recipe/search',
      {
        params: {
          query: {
            ...props.filters,
            limit: props.limit,
            minSimilarity: props.minSimilarity,
            availableForFridge: context?.fridgeId,
            search: props.recipe.name
          }
        }
      }
    ).then(
      monitorOutcome(setStatus)
    ).then(data => {
      setRecipes(data.filter(recipe => recipe.id !== props.recipe.id))
    }).catch(err => {
      console.error(err)
    })
  }, [props.recipe.name, props.limit, props.minSimilarity, props.filters, context])

  return (
    <div>
      <LoadingSpinner status={status} />
      <RecipeList recipes={recipes} status={status} />
    </div>
  )
}
