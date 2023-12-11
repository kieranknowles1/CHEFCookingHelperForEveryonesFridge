import React from 'react'
import { useParams } from 'react-router-dom'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import RecipeIngredient from '../components/RecipeIngredient'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'

type Recipe = components['schemas']['Recipe']
// TODO: Probably want this to be a modal
export default function RecipePage (): React.JSX.Element {
  const [status, setStatus] = React.useState<LoadingStatus>('loading')
  const [recipe, setRecipe] = React.useState<Recipe>()

  // TODO: Is it right to throw an error here?
  const params = useParams<{ id: string }>()
  if (params.id === undefined) {
    throw new Error('No recipe ID provided')
  }
  const id = Number.parseInt(params.id)
  if (Number.isNaN(id)) {
    throw new Error('Invalid recipe ID')
  }

  React.useEffect(() => {
    apiClient.GET(
      '/recipe/{id}',
      { params: { path: { id } } }
    ).then(response => {
      if (response.data === undefined) {
        throw new Error(response.error)
      }
      setRecipe(response.data)
      setStatus('done')
    }).catch(err => {
      console.error(err)
      setStatus('error')
    })
  }, [])

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
            {recipe.directions.split('\n').map(line => <>{line}<br /></>)}
          </p>
          {/* TODO: Implement, deduct ingredients from fridge */ }
          <button>Made it - Remove Ingredients From Fridge</button>
        </div>
      )}
    </main>
  )
}