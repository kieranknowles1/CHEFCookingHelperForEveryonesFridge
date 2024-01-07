import { Link } from 'react-router-dom'
import React from 'react'
import { useDebounce } from 'use-debounce'

import LoadingSpinner, { type LoadingStatus, getHighestStatus } from '../components/LoadingSpinner'
import Recipe, { type RecipeProps } from '../components/Recipe'
import Search from '../components/Search'
import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import monitorStatus from '../utils/monitorStatus'
import useSafeContext from '../contexts/useSafeContext'

const PAGE_SIZE = 100

export default function FindRecipesPage (): React.JSX.Element {
  const context = useSafeContext(UserContext)

  const [recipesStatus, setRecipesStatus] = React.useState<LoadingStatus>('loading')
  const [recipes, setRecipes] = React.useState<RecipeProps[]>([])

  const [mealTypesStatus, setMealTypesStatus] = React.useState<LoadingStatus>('loading')
  const [mealTypes, setMealTypes] = React.useState<string[]>([])
  const [selectedMealType, setSelectedMealType] = React.useState<string | undefined>(undefined)

  const [checkAmounts, setCheckAmounts] = React.useState<boolean>(true)
  const [maxMissingIngredients, setMaxMissingIngredients] = React.useState<number>(0)
  const [debouncedMaxMissingIngredients] = useDebounce(maxMissingIngredients, 200)

  const [query, setQuery] = React.useState('')
  const [filtered, setFiltered] = React.useState<RecipeProps[]>([])

  const [page, setPage] = React.useState(0)
  function getTotalPages (): number {
    return Math.ceil(filtered.length / PAGE_SIZE)
  }

  React.useEffect(() => {
    setRecipes([])
    apiClient.GET(
      '/fridge/{fridgeId}/recipe/available',
      {
        params: {
          path: { fridgeId: context.fridgeId },
          query: {
            checkAmounts,
            maxMissingIngredients: debouncedMaxMissingIngredients,
            mealType: selectedMealType
          }
        }
      }
    ).then(
      monitorStatus(setRecipesStatus)
    ).then(data => {
      setRecipes(data)
    }).catch(err => {
      console.error(err)
    })
  }, [context.fridgeId, checkAmounts, debouncedMaxMissingIngredients, selectedMealType])

  React.useEffect(() => {
    apiClient.GET(
      '/mealtype/list'
    ).then(
      monitorStatus(setMealTypesStatus)
    ).then(data => {
      setMealTypes(data)
    }).catch(err => {
      console.error(err)
    })
  }, [])

  React.useEffect(() => {
    setFiltered(recipes.filter(r => r.name.toLowerCase().includes(query.toLowerCase())))
  }, [recipes, query])

  const pageButtons = (
    <div className='flex justify-center'>
      <button className='btn' onClick={() => { setPage(page - 1) }} disabled={page === 0}>Previous</button>
      <span className='mx-3'>Page {page + 1} / {getTotalPages()}</span>
      <button className='btn' onClick={() => { setPage(page + 1) }} disabled={page >= getTotalPages() - 1}>Next</button>
    </div>
  )

  return (
    <main>
      <h1>Find Recipes</h1>
      <p>
        These are all of the recipes you can make with you current ingredients.
        <br />
        Click any recipe to view details and/or mark it as have been made.
      </p>

      <label>Check I have enough of each ingredient: <input type='checkbox' checked={checkAmounts} onChange={e => { setCheckAmounts(e.target.checked) }} /></label><br />
      <label>Max missing or insufficient amount ingredients: <input type='number' value={maxMissingIngredients} min={0} onChange={e => { setMaxMissingIngredients(e.target.value === '' ? 0 : parseInt(e.target.value)) }} /></label><br />
      <label>Meal Type: <select value={selectedMealType ?? ''} onChange={e => { setSelectedMealType(e.target.value === '' ? undefined : e.target.value) }}>
        <option value=''>Any</option>
        {mealTypes.map(mt => <option key={mt} value={mt}>{mt}</option>)}
      </select></label>
      <hr className='my-2 mx-2' />
      {recipesStatus === 'done' && <p>{recipes.length} recipes found.</p>}
      <label>Search: <Search setQuery={q => { setQuery(q); setPage(0) }} /></label>

      <LoadingSpinner status={getHighestStatus([recipesStatus, mealTypesStatus])} />
      {pageButtons}
      <ul className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
        {filtered
          .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
          .map(recipe => (
            <Recipe key={recipe.id} {...recipe} />
          ))}
      </ul>
      {recipesStatus === 'done' && recipes.length === 0 && <p>You can&apos;t make anything with your current ingredients. <Link to='/fridge'>Add Some</Link></p>}
      {pageButtons}
    </main>
  )
}
