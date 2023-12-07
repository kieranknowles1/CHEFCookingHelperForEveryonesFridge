import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'
import useSafeContext from '../contexts/useSafeContext'

type Recipe = components['schemas']['Recipe']

export default function FindRecipesPage (): React.JSX.Element {
  const context = useSafeContext(UserContext)

  const [status, setStatus] = React.useState<LoadingStatus>('loading')
  const [recipes, setRecipes] = React.useState<Recipe[]>([])

  React.useEffect(() => {
    apiClient.GET(
      '/fridge/{fridgeId}/recipe/available',
      { params: { path: { fridgeId: context.fridgeId } } }
    ).then(response => {
      if (response.data === undefined) {
        throw new Error(response.error)
      }
      // TODO: Set recipes. Need to return more data from API
      setStatus('done')
    }).catch(err => {
      console.error(err)
      setStatus('error')
    })
  }, [])

  return (
    <main>
      <h1>Find Recipes</h1>
      <LoadingSpinner status={status} />
      <ul>
        {recipes.map(recipe => (
          <li key={recipe.id}>{recipe.name}</li>
        ))}
      </ul>
    </main>
  )
}
