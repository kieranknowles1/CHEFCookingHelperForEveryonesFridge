import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'
import { Link } from 'react-router-dom'
import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import RecipeSearchOptions, { type SearchFilters } from '../components/RecipeSearchOptions'
import UserContext, { type UserState } from '../contexts/UserContext'
import { FridgePicker } from '../components/FridgePicker'
import RecipeList from '../components/RecipeList'
import { type RecipeProps } from '../components/Recipe'
import Search from '../components/inputs/Search'
import apiClient from '../apiClient'
import monitorStatus from '../utils/monitorStatus'

const PAGE_SIZE = 100

export interface FindRecipesPageProps {
  setUserState: (state: UserState) => void
}

export default function FindRecipesPage (props: FindRecipesPageProps): React.JSX.Element {
  const context = React.useContext(UserContext)

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
      '/recipe/search',
      {
        params: {
          query: {
            ...filters,
            availableForFridge: context?.fridge?.id,
            limit: 1000,
            suitableForUsers: context !== null ? [context.userId] : undefined
          }
        }
      }
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      setRecipes(data)
    }).catch(err => {
      console.error(err)
    })
  }, [context, filters])

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
        <BiChevronLeft size={24} className='inline' /> Previous
      </button>
      <span className='mx-3'>Page {page + 1} / {getTotalPages()}</span>
      <button className='btn' onClick={() => { setPage(page + 1) }} disabled={page >= getTotalPages() - 1}>
        Next <BiChevronRight size={24} className='inline' />
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
      {context !== null && <FridgePicker
        selected={context.fridge}
        setSelected={fridge => {
          props.setUserState({
            ...context,
            fridge
          })
        }}
      />}
      <RecipeSearchOptions filters={filters} setFilters={setFilters} />
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
