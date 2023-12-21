import React from 'react'
import { useParams } from 'react-router-dom'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import NotFoundMessage from '../components/NotFoundMessage'
import Recipe from '../components/Recipe'
import RecipeIngredient from '../components/RecipeIngredient'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'

type RecipeResponse = components['schemas']['Recipe']
type SimilarRecipeResponse = components['schemas']['SimilarRecipe']

const MAX_SIMILAR_RECIPES = 100
const MIN_SIMILARIY = 0.5

export default function RecipePage (): React.JSX.Element {
  const [status, setStatus] = React.useState<LoadingStatus | 'notfound'>('loading')
  const [recipe, setRecipe] = React.useState<RecipeResponse>()

  const [similarRecipes, setSimilarRecipes] = React.useState<SimilarRecipeResponse[]>([])
  const [similarStatus, setSimilarStatus] = React.useState<LoadingStatus>('loading')

  // TODO: Is it right to throw an error here?
  const params = useParams<{ id: string }>()
  // Invalid ID is treated as 404
  if (params.id === undefined) {
    return <NotFoundMessage />
  }
  const id = Number.parseInt(params.id)
  if (Number.isNaN(id)) {
    return <NotFoundMessage />
  }

  React.useEffect(() => {
    apiClient.GET(
      '/recipe/{id}',
      { params: { path: { id } } }
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
  }, [])

  React.useEffect(() => {
    apiClient.GET(
      '/recipe/{id}/similar',
      {
        params: {
          path: { id },
          query: { limit: MAX_SIMILAR_RECIPES, minSimilarity: MIN_SIMILARIY }
        }
      }
    ).then(response => {
      if (response.data === undefined) {
        throw new Error(response.error)
      }
      setSimilarRecipes(response.data)
      setSimilarStatus('done')
    }).catch(err => {
      console.error(err)
      setSimilarStatus('error')
    })
  }, [])

  // TODO: Show how much of each ingredient is available and highlight missing ones
  return (
    <main>
      {status === 'notfound' ? <NotFoundMessage /> : <LoadingSpinner status={status} />}
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
            {recipe.directions.split('\n').map(line => <>{line}<br /></>)}
          </p>
          {/* TODO: Implement, deduct ingredients from fridge */ }
          <button>Made it - Remove Ingredients From Fridge</button>
        </div>
      )}
      <h2>Similar Recipes</h2>
      <LoadingSpinner status={similarStatus} />
      <ul className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
        {similarRecipes.map(recipe => (
          <Recipe key={recipe.id} {...recipe} />
        ))}
      </ul>
    </main>
  )
}
