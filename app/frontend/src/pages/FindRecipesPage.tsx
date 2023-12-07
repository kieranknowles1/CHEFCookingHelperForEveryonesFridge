import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import Recipe, { type RecipeProps } from '../components/Recipe'
import Search from '../components/Search'
import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import useSafeContext from '../contexts/useSafeContext'

export default function FindRecipesPage (): React.JSX.Element {
  const context = useSafeContext(UserContext)

  const [status, setStatus] = React.useState<LoadingStatus>('loading')
  const [recipes, setRecipes] = React.useState<RecipeProps[]>([])

  const [query, setQuery] = React.useState('')
  const [filtered, setFiltered] = React.useState<RecipeProps[]>([])

  React.useEffect(() => {
    apiClient.GET(
      '/fridge/{fridgeId}/recipe/available',
      { params: { path: { fridgeId: context.fridgeId } } }
    ).then(response => {
      if (response.data === undefined) {
        throw new Error(response.error)
      }
      setRecipes(response.data)
      setStatus('done')
    }).catch(err => {
      console.error(err)
      setStatus('error')
    })
  }, [])

  React.useEffect(() => {
    setFiltered(recipes.filter(r => r.name.toLowerCase().includes(query.toLowerCase())))
  }, [recipes, query])

  return (
    <main>
      <h1>Find Recipes</h1>
      <p>
        These are all of the recipes you can make with you current ingredients.
        <br />
        Click any recipe to view details and/or mark it as have been made.
      </p>
      <Search setQuery={setQuery} />
      <LoadingSpinner status={status} />
      <ul className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
        {filtered.map(recipe => (
          <Recipe key={recipe.id} {...recipe} />
        ))}
      </ul>
    </main>
  )
}
