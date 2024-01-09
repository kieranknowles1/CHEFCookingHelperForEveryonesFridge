import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import Icon from '@mdi/react'
import { Link } from 'react-router-dom'
import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import RecipeSearchFilters, { type SearchFilters } from '../components/RecipeSearchOptions'
import RecipeList from '../components/RecipeList'
import { type RecipeProps } from '../components/Recipe'
import Search from '../components/Search'
import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import monitorStatus from '../utils/monitorStatus'
import useSafeContext from '../contexts/useSafeContext'

const PAGE_SIZE = 100

export default function FindRecipesPage (): React.JSX.Element {
  const context = useSafeContext(UserContext)

  const [status, setStatus] = React.useState<LoadingStatus>('loading')
  const [recipes, setRecipes] = React.useState<RecipeProps[]>([])

  const [filters, setFilters] = React.useState<SearchFilters>({
    checkAmounts: true,
    maxMissingIngredients: 0,
    mealType: undefined
  })

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
          query: filters
        }
      }
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      setRecipes(data)
    }).catch(err => {
      console.error(err)
    })
  }, [context.fridgeId, filters])

  React.useEffect(() => {
    setFiltered(recipes.filter(r => r.name.toLowerCase().includes(query.toLowerCase())))
  }, [recipes, query])

  const [pageItems, setPageItems] = React.useState<RecipeProps[]>([])
  React.useEffect(() => {
    setPageItems(filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE))
  }, [filtered, page])

  const pageButtons = (
    <div className='flex justify-center'>
      <button className='btn' onClick={() => { setPage(page - 1) }} disabled={page === 0}>
        <Icon path={mdiChevronLeft} size={1} className='inline' /> Previous
      </button>
      <span className='mx-3'>Page {page + 1} / {getTotalPages()}</span>
      <button className='btn' onClick={() => { setPage(page + 1) }} disabled={page >= getTotalPages() - 1}>
        Next <Icon path={mdiChevronRight} size={1} className='inline' />
      </button>
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
      <RecipeSearchFilters filters={filters} setFilters={setFilters} />
      <hr className='my-2 mx-2' />
      {status === 'done' && <p>{recipes.length} recipes found.</p>}
      <Search setQuery={q => { setQuery(q); setPage(0) }} />

      <LoadingSpinner status={status} />
      {status === 'done' && pageButtons}
      <RecipeList recipes={pageItems} status={status} />
      {status === 'done' && recipes.length === 0 && <p>You can&apos;t make anything with your current ingredients. <Link to='/fridge'>Add Some</Link></p>}
      {status === 'done' && pageButtons}
    </main>
  )
}
