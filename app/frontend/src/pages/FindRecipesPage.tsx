import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'
import { Link } from 'react-router-dom'
import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import RecipeSearchOptions, { type SearchFilters } from '../components/RecipeSearchOptions'
import UserContext, { type UserState } from '../contexts/UserContext'
import RecipeList from '../components/RecipeList'
import { type RecipeProps } from '../components/Recipe'
import Search from '../components/inputs/Search'
import apiClient from '../apiClient'
import monitorOutcome from '../utils/monitorOutcome'
import { useDebounce } from 'use-debounce'

const PAGE_SIZE = 100

export interface FindRecipesPageProps {
  setUserState: (state: UserState | null) => void
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

  const [originalQuery, setOriginalQuery] = React.useState('')
  const [query] = useDebounce(originalQuery, 500)

  const [page, setPage] = React.useState(0)
  function getTotalPages (): number {
    return Math.ceil(recipes.length / PAGE_SIZE)
  }

  React.useEffect(() => {
    setRecipes([])

    apiClient.GET(
      '/recipe/search',
      {
        params: {
          query: {
            ...filters,
            availableForFridge: context?.fridgeId,
            limit: 1000,
            suitableForUsers: context !== null ? [context.userId] : undefined,
            search: query === '' ? undefined : query,
            minSimilarity: 0
          }
        }
      }
    ).then(
      monitorOutcome(setStatus)
    ).then(data => {
      setRecipes(data)
    }).catch(err => {
      console.error(err)
    })
  }, [context, filters, query])

  const [pageItems, setPageItems] = React.useState<RecipeProps[]>([])
  React.useEffect(() => {
    setPageItems(recipes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE))
  }, [recipes, page])

  const pageButtons = (
    <div className='flex justify-center'>
      <button onClick={() => { setPage(page - 1) }} disabled={page === 0}>
        <BiChevronLeft size={24} className='inline' /> Previous
      </button>
      <span className='mx-3'>Page {page + 1} / {getTotalPages()}</span>
      <button onClick={() => { setPage(page + 1) }} disabled={page >= getTotalPages() - 1}>
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
      <RecipeSearchOptions
        filters={filters}
        setUserState={props.setUserState}
        setFilters={setFilters}
      />
      <hr className='my-2 mx-2' />
      {status === 'done' && <p>{recipes.length} recipes found.</p>}
      <Search setQuery={q => { setOriginalQuery(q); setPage(0) }} />

      <LoadingSpinner status={status} />
      {status === 'done' && pageButtons}
      <RecipeList recipes={pageItems} status={status} />
      {status === 'done' && recipes.length === 0 && <p>You can&apos;t make anything with your current ingredients. <Link to='/fridge'>Add Some</Link></p>}
      {status === 'done' && pageButtons}
    </main>
  )
}
