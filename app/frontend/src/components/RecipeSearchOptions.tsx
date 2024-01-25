import React from 'react'

import UserContext, { type UserState } from '../contexts/UserContext'
import apiClient from '../apiClient'
import monitorStatus from '../utils/monitorStatus'

import LoadingSpinner, { DefaultSmallSpinner, type LoadingStatus } from './LoadingSpinner'
import { FridgePicker } from './FridgePicker'

export interface SearchFilters {
  checkAmounts: boolean
  maxMissingIngredients: number
  mealType?: string
}

export interface RecipeSearchOptionsProps {
  filters: SearchFilters
  setUserState: (userState: UserState) => void
  setFilters: (filters: SearchFilters) => void
}

/**
 * Component for filters to search recipes by.
 * Default options are set in the provided filters prop.
 */
export default function RecipeSearchOptions (props: RecipeSearchOptionsProps): React.ReactElement {
  const context = React.useContext(UserContext)

  const { filters, setFilters } = props

  const [status, setStatus] = React.useState<LoadingStatus>('loading')
  const [mealTypes, setMealTypes] = React.useState<string[]>([])

  React.useEffect(() => {
    apiClient.GET(
      '/mealtype/list'
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      setMealTypes(data)
    }).catch(err => {
      console.error(err)
    })
  }, [])

  let mealTypeElement
  if (status !== 'done') {
    mealTypeElement = <LoadingSpinner status={status} spinner={DefaultSmallSpinner} className='inline' />
  } else {
    mealTypeElement = (
        <select
          value={filters.mealType ?? ''}
          onChange={e => {
            const value = e.target.value === '' ? undefined : e.target.value
            setFilters({ ...filters, mealType: value })
          }}
        >
        <option value=''>Any</option>
        {mealTypes.map(mt => <option key={mt} value={mt}>{mt}</option>)}
      </select>
    )
  }

  return (
    <div>
      {context === null
        ? <p>Log in to filter by the ingredients you have!</p>
        : <>
            <label>Fridge: <FridgePicker
              setUserState={props.setUserState}
            /></label><br />
            <label>Check I have enough of each ingredient:{' '}
              <input
                type='checkbox'
                checked={filters.checkAmounts}
                onChange={e => { setFilters({ ...filters, checkAmounts: e.target.checked }) }}
              />
            </label><br />
            <label>Max missing or insufficient amount ingredients:{' '}
              <input type='number'
                value={filters.maxMissingIngredients}
                min={0}
                onChange={e => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value)
                  setFilters({ ...filters, maxMissingIngredients: value })
                }}
              />
              </label><br />
          </>}
      <label>Meal Type: {mealTypeElement}</label>
    </div>
  )
}
