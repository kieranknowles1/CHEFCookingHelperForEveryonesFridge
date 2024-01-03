import React from 'react'
import { useParams } from 'react-router-dom'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import NotFoundMessage from '../components/NotFoundMessage'
import RecipeIngredient from '../components/RecipeIngredient'
import SimilarRecipes from '../components/SimilarRecipes'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'
import monitorStatus from '../utils/monitorStatus'

type Recipe = components['schemas']['Recipe']

const MAX_SIMILAR_RECIPES = 100
const MIN_SIMILARITY = 0.5

export default function RecipePage (): React.JSX.Element {
  const [status, setStatus] = React.useState<LoadingStatus | 'notfound'>('loading')
  const [recipe, setRecipe] = React.useState<Recipe>()

  const { id } = useParams()
  const idNumber = Number.parseInt(id ?? 'NaN')
  if (Number.isNaN(idNumber)) {
    return <NotFoundMessage />
  }

  React.useEffect(() => {
    setRecipe(undefined)
    apiClient.GET(
      '/recipe/{id}',
      { params: { path: { id: idNumber } } }
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      setRecipe(data)
    }).catch(err => {
      console.error(err)
      // TODO: Check error code. Use notfound for 404, error for everything else.
      // setStatus('notfound')
    })
  }, [idNumber])

  if (status === 'notfound') {
    return <NotFoundMessage />
  }

  return (
    <main>
      <LoadingSpinner status={status} />
      {recipe !== undefined && (
        <div>
          <h1>{recipe.name}</h1>
          <a href={`http://${recipe.link}`} target='_blank' rel='noreferrer'>Source</a>
          <p>Meal Type: {recipe.mealType}</p>
          <h2>Ingredients</h2>
          <ul className='list-inside list-disc'>
            {recipe.ingredients.map(entry => <RecipeIngredient key={entry.ingredient.id} {...entry} />)}
          </ul>
          <h2>Directions</h2>
          <p>
            {recipe.directions.split('\n').map((line, index) => <React.Fragment key={index}>{line}</React.Fragment>)}
          </p>
          {/* TODO: Implement, deduct ingredients from fridge */ }
          <button>Made it - Remove Ingredients From Fridge</button>
        </div>
      )}
      <h2>Similar recipes that you can make</h2>
      {recipe !== undefined && <SimilarRecipes recipeId={recipe.id} limit={MAX_SIMILAR_RECIPES} minSimilarity={MIN_SIMILARITY} />}
    </main>
  )
}
