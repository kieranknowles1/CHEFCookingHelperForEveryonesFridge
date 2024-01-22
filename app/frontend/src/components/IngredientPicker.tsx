import { Combobox } from '@headlessui/react'
import React from 'react'

import apiClient from '../apiClient'
import { type components } from '../types/api.generated'
import monitorStatus from '../utils/monitorStatus'

import LoadingSpinner, { type LoadingStatus } from './LoadingSpinner'

type Ingredient = components['schemas']['Ingredient']

export interface IngredientSelectorProps {
  selected: Ingredient | null
  setSelected: (ingredient: Ingredient | null) => void

  excludedIds: Set<number>
}

/**
 * Component to select ingredients from a list.
 * Shows all ingredients, except those that are excluded in the props.
 * Does not include a label.
 */
export function IngredientPicker (props: IngredientSelectorProps): React.JSX.Element {
  const [allIngredients, setAllIngredients] = React.useState<Ingredient[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  const [query, setQuery] = React.useState('')
  const [filteredIngredients, setFilteredIngredients] = React.useState<Ingredient[]>([])

  React.useEffect(() => {
    apiClient.GET('/ingredient/all')
      .then(monitorStatus(setStatus))
      .then(setAllIngredients)
      .catch(console.error)
  }, [])

  React.useEffect(() => {
    const lowerQuery = query.toLowerCase()
    setFilteredIngredients(allIngredients.filter(
      ingredient => !props.excludedIds.has(ingredient.id) && ingredient.name.toLowerCase().includes(lowerQuery)
    ))
  }, [allIngredients, props.excludedIds, query])

  return (
    <>
      <LoadingSpinner status={status} />
      <Combobox value={props.selected} onChange={props.setSelected}>
        <Combobox.Input
          className='bg-raisin_black-800 text-citron-100'
          onChange={(event) => { setQuery(event.target.value) }}
          displayValue={(ingredient: Ingredient | null) => ingredient?.name ?? ''}
          autoFocus
          required
        />
        <Combobox.Options>
          {filteredIngredients.map(ingredient => (
            <Combobox.Option key={ingredient.id} value={ingredient}>
              {({ active }) => (
                <li className={active ? 'bg-tiffany_blue-200' : 'bg-tiffany_blue-100'}>
                  {ingredient.name}
                </li>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </>
  )
}
