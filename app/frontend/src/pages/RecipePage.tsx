import React from 'react'
import { useParams } from 'react-router-dom'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import monitorStatus, { type ApiError } from '../utils/monitorStatus'
import MadeItButton from '../components/MadeItButton'
import NotFoundMessage from '../components/NotFoundMessage'
import RecipeIngredient from '../components/RecipeIngredient'
import SimilarRecipes from '../components/SimilarRecipes'
import SingleRecipeHistory from '../components/SingleRecipeHistory'
import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'

type Recipe = components['schemas']['Recipe']

const MAX_SIMILAR_RECIPES = 100
const MIN_SIMILARITY = 0.5

export default function RecipePage (): React.JSX.Element {
  const context = React.useContext(UserContext)

  const [recipeStatus, setRecipeStatus] = React.useState<LoadingStatus | 'notfound'>('loading')
  const [recipe, setRecipe] = React.useState<Recipe>()
  const [onlyAvailable, setOnlyAvailable] = React.useState<boolean>(true)

  const [availableAmountsStatus, setAvailableAmountsStatus] = React.useState<LoadingStatus>('loading')
  const [availableAmounts, setAvailableAmounts] = React.useState<Map<number, number> | null>(null)

  const { id } = useParams()
  const idNumber = Number.parseInt(id ?? 'NaN')
  if (Number.isNaN(idNumber)) {
    return <NotFoundMessage />
  }

  React.useEffect(() => {
    setRecipe(undefined)
    apiClient.GET(
      '/recipe/{recipeId}',
      { params: { path: { recipeId: idNumber } } }
    ).then(
      monitorStatus(setRecipeStatus)
    ).then(data => {
      setRecipe(data)
    }).catch((err: ApiError) => {
      console.error(err)
      if (err.errors.status === 404) {
        setRecipeStatus('notfound')
      }
    })
  }, [idNumber])

  React.useEffect(() => {
    setAvailableAmounts(null)
    if (context === null) {
      // Don't try to fetch available amounts if the user is not logged in
      setAvailableAmountsStatus('done')
      return
    }
    apiClient.GET(
      '/fridge/{fridgeId}/ingredient/all/amount',
      { params: { path: { fridgeId: context.fridgeId } } }
    ).then(
      monitorStatus(setAvailableAmountsStatus)
    ).then(data => {
      setAvailableAmounts(new Map(data.map(entry => [entry.ingredient.id, entry.amount])))
    }).catch((err: ApiError) => {
      console.error(err)
    })
  }, [context])

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
        <MadeItButton recipeId={recipe.id} />
      </div>
      {context !== null && <>
        <h2>History</h2>
        <SingleRecipeHistory userId={context.userId} recipeId={recipe.id} />
      </>}
      <h2>Similar recipes</h2>
      <label>Only show recipes with ingredients available in my fridge:{' '}
        <input
          type='checkbox'
          checked={onlyAvailable}
          onChange={e => { setOnlyAvailable(e.target.checked) }}
        />
      </label>
      <SimilarRecipes
        recipe={recipe}
        limit={MAX_SIMILAR_RECIPES}
        minSimilarity={MIN_SIMILARITY}
        onlyAvailable={onlyAvailable}
      />
    </main>
  )
}
