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

  const [checkAmounts, setCheckAmounts] = React.useState<boolean>(true)
  const [maxMissingIngredients, setMaxMissingIngredients] = React.useState<number>(0)

  const [query, setQuery] = React.useState('')
  const [filtered, setFiltered] = React.useState<RecipeProps[]>([])

  React.useEffect(() => {
    setStatus('loading')
    setRecipes([])
    apiClient.GET(
      '/fridge/{fridgeId}/recipe/available',
      { params: { path: { fridgeId: context.fridgeId }, query: { checkAmounts, maxMissingIngredients } } }
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
  }, [context.fridgeId, checkAmounts, maxMissingIngredients])

  React.useEffect(() => {
    setFiltered(recipes.filter(r => r.name.toLowerCase().includes(query.toLowerCase())))
  }, [recipes, query])

  // TODO: Lazy render recipes
  return (
    <main>
      <h1>Find Recipes</h1>
      <p>
        These are all of the recipes you can make with you current ingredients.
        <br />
        Click any recipe to view details and/or mark it as have been made.
      </p>
      <label>Check Available Amounts: <input type='checkbox' checked={checkAmounts} onChange={e => { setCheckAmounts(e.target.checked) }} /></label>
      <label>Max Missing Ingredients: <input type='number' value={maxMissingIngredients} min={0} onChange={e => { setMaxMissingIngredients(e.target.value === '' ? 0 : parseInt(e.target.value)) }} /></label>
      {status === 'done' && <p>{recipes.length} recipes found.</p>}
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
