import React from 'react'
import { useParams } from 'react-router-dom'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import RecipeSearchOptions, { type SearchFilters } from '../components/RecipeSearchOptions'
import UserContext, { type UserState } from '../contexts/UserContext'
import apiClient, { createAuthHeaders } from '../apiClient'
import { type ApiError } from '../types/ApiError'
import NotFoundMessage from '../errorpages/NotFoundMessage'
import { type components } from '../types/api.generated'
import monitorOutcome from '../utils/monitorOutcome'

import MadeItButton from './recipe/MadeItButton'
import RecipeIngredient from './recipe/RecipeIngredient'
import SimilarRecipes from './recipe/SimilarRecipes'
import SingleRecipeHistory from './recipe/SingleRecipeHistory'

type Recipe = components['schemas']['Recipe']

const MAX_SIMILAR_RECIPES = 100
const MIN_SIMILARITY = 0.5

export interface RecipePageProps {
  setUserState: (userState: UserState) => void
}

export default function RecipePage (props: RecipePageProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  const [recipeStatus, setRecipeStatus] = React.useState<LoadingStatus | 'notfound'>('loading')
  const [recipe, setRecipe] = React.useState<Recipe>()

  const [filters, setFilters] = React.useState<SearchFilters>({
    checkAmounts: true,
    maxMissingIngredients: 0
  })

  const [availableAmountsStatus, setAvailableAmountsStatus] = React.useState<LoadingStatus>('loading')
  const [availableAmounts, setAvailableAmounts] = React.useState<Map<number, number> | null>(null)

  const { id } = useParams()
  const idNumber = Number.parseInt(id ?? 'NaN')
  if (Number.isNaN(idNumber)) {
    return <NotFoundMessage />
  }

  // Fetch recipe data
  React.useEffect(() => {
    setRecipe(undefined)
    apiClient.GET(
      '/recipe/{recipeId}',
      { params: { path: { recipeId: idNumber } } }
    ).then(
      monitorOutcome(setRecipeStatus)
    ).then(data => {
      setRecipe(data)
    }).catch((err: ApiError) => {
      console.error(err)
      if (err.errors.status === 404) {
        setRecipeStatus('notfound')
      }
    })
  }, [idNumber])

  // Fetch available amounts
  React.useEffect(() => {
    setAvailableAmounts(null)
    if (context?.fridgeId === undefined) {
      // Don't try to fetch available amounts if the user is not logged in or has not selected a fridge
      setAvailableAmountsStatus('done')
      return
    }
    apiClient.GET(
      '/fridge/{fridgeId}/ingredient/all/amount',
      {
        params: { path: { fridgeId: context.fridgeId } },
        headers: createAuthHeaders(context)
      }
    ).then(
      monitorOutcome(setAvailableAmountsStatus)
    ).then(data => {
      setAvailableAmounts(new Map(data.map(entry => [entry.ingredient.id, entry.amount])))
    }).catch((err: ApiError) => {
      console.error(err)
    })
  }, [context])

  // Set meal type to the recipe's meal type
  React.useEffect(() => {
    if (recipe !== undefined) {
      setFilters({ ...filters, mealType: recipe.mealType })
    }
  }, [recipe])

  if (recipeStatus === 'notfound') {
    return <NotFoundMessage />
  }
  // Can't show anything meaningful while still loading
  if (recipe === undefined) {
    return <LoadingSpinner status={recipeStatus} />
  }

  return (
    <main>
      <div>
        <LoadingSpinner status={availableAmountsStatus} />
        <h1>{recipe.name}</h1>
        <a href={`http://${recipe.link}`} target='_blank' rel='noreferrer'>Source</a>
        <p>Meal Type: {recipe.mealType}</p>
        <h2>Ingredients</h2>
        <ul className='list-inside list-disc'>
          {recipe.ingredients.map(entry =>
            <RecipeIngredient
              key={entry.ingredient.id}
              availableAmount={availableAmounts === null ? 'nologin' : (availableAmounts.get(entry.ingredient.id) ?? 0)}
              {...entry}
            />)}
        </ul>
        <h2>Directions</h2>
        <ol className='list-inside list-decimal'>
          {recipe.directions.split('\n').map((line, index) =>
            <li key={index}>{line}</li>
          )}
        </ol>
        {context?.fridgeId !== undefined
          ? <MadeItButton recipeId={recipe.id} />
          : <p>Log in and select a fridge to mark this recipe as made!</p>
        }
      </div>
      {context !== null && <>
        <h2>History</h2>
        <SingleRecipeHistory userId={context.userId} recipeId={recipe.id} />
      </>}
      <h2>Similar recipes</h2>
      <RecipeSearchOptions
        filters={filters}
        setUserState={props.setUserState}
        setFilters={setFilters}
      />
      <SimilarRecipes
        recipe={recipe}
        limit={MAX_SIMILAR_RECIPES}
        minSimilarity={MIN_SIMILARITY}
        filters={filters}
      />
    </main>
  )
}
