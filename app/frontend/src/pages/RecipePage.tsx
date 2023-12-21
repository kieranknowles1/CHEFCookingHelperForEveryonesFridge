import React from 'react'
import { useParams } from 'react-router-dom'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import NotFoundMessage from '../components/NotFoundMessage'
import RecipeIngredient from '../components/RecipeIngredient'
import SimilarRecipes from '../components/SimilarRecipes'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'

type Recipe = components['schemas']['Recipe']

const MAX_SIMILAR_RECIPES = 100
const MIN_SIMILARIY = 0.5

export default function RecipePage (): React.JSX.Element {
  const [status, setStatus] = React.useState<LoadingStatus | 'notfound'>('loading')
  const [recipe, setRecipe] = React.useState<Recipe>()

  const { id } = useParams()
  const idNumber = Number.parseInt(id ?? 'NaN')
  if (Number.isNaN(idNumber)) {
    return <NotFoundMessage />
  }

  React.useEffect(() => {
    setStatus('loading')
    setRecipe(undefined)
    apiClient.GET(
      '/recipe/{id}',
      { params: { path: { id: idNumber } } }
    ).then(response => {
      if (response.data !== undefined) {
        setRecipe(response.data)
        setStatus('done')
      } else {
        setStatus('notfound')
      }
    }).catch(err => {
      console.error(err)
      setStatus('error')
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
      {recipe !== undefined && <SimilarRecipes recipeId={recipe.id} limit={MAX_SIMILAR_RECIPES} minSimilarity={MIN_SIMILARIY} />}
    </main>
  )
}
