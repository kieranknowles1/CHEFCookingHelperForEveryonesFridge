import React from 'react'
import { useParams } from 'react-router-dom'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import NotFoundMessage from '../components/NotFoundMessage'
import RecipeIngredient from '../components/RecipeIngredient'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'

type Recipe = components['schemas']['Recipe']
// TODO: Probably want this to be a modal
export default function RecipePage (): React.JSX.Element {
  const [status, setStatus] = React.useState<LoadingStatus | 'notfound'>('loading')
  const [recipe, setRecipe] = React.useState<Recipe>()

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
    </main>
  )
}
