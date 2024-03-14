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

/**
 * Indexes into recommendations that will be displayed to the user
 * Based on paper by (Bollen et al., 2010) "Understanding Choice Overload in Recommender Systems"
 * See main report for more details
 */
export const suggestionIndexes = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  10, 20, 30, 40, 50, 60, 70, 80, 90,
  100, 150, 200, 250, 300, 350, 400, 450, 500
]

export type SimilarRecipeProps = {
  recipe: Recipe
  minSimilarity: number
  filters: SearchFilters
} & (
  { limit: number } | { indexes: number[] }
)

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
            limit: 'limit' in props ? props.limit : props.indexes[props.indexes.length - 1] + 1,
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
  }, [props.recipe.name, props.minSimilarity, props.filters, context])

  return (
    <div>
      <LoadingSpinner status={status} />
      <RecipeList recipes={'limit' in props
        ? recipes
        : props.indexes.map(index => recipes[index])
        } status={status} />
    </div>
  )
}
