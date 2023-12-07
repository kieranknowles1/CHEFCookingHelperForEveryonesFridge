import { Combobox } from '@headlessui/react'
import React from 'react'

import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'
import useSafeContext from '../contexts/useSafeContext'

import LoadingSpinner, { type LoadingStatus } from './LoadingSpinner'

type Ingredient = components['schemas']['Ingredient']

export interface AddIngredientProps {
  currentIngredients: Ingredient[]
  onSubmit: (newItem: Ingredient, amount: number) => void
}

export default function AddIngredient (props: AddIngredientProps): React.JSX.Element {
  const currentIngredientIds = new Set(props.currentIngredients.map(i => i.id))

  const context = useSafeContext(UserContext)

  const [status, setStatus] = React.useState<LoadingStatus>('loading')
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([])

  const [selected, setSelected] = React.useState<Ingredient | null>(null)
  const [amount, setAmount] = React.useState(0)

  const [filteredIngredients, setFilteredIngredients] = React.useState<Ingredient[]>([])
  const [query, setQuery] = React.useState('')

  React.useEffect(() => {
    apiClient.GET(
      '/ingredient/all',
      { }
    ).then(response => {
      if (response.data === undefined) {
        throw new Error(response.error)
      }
      setIngredients(response.data.filter(
        ingredient => !ingredient.assumeUnlimited && !currentIngredientIds.has(ingredient.id)
      ))
      setStatus('done')
    }).catch(err => {
      console.error(err)
      setStatus('error')
    })
  }, [])

  React.useEffect(() => {
    setFilteredIngredients(ingredients.filter(
      ingredient => ingredient.name.toLowerCase().includes(query.toLowerCase())
    ))
  }, [ingredients, query])

  function onSubmit (event: React.FormEvent): void {
    event.preventDefault()

    if (selected === null) {
      alert('Please select an ingredient.')
      return
    }
    if (isNaN(amount)) {
      alert('Please input a number for the amount')
      return
    }

    apiClient.POST(
      '/fridge/{fridgeId}/ingredient/{ingredientId}/amount',
      { params: { path: { fridgeId: context.fridgeId, ingredientId: selected.id }, query: { amount } } }
    ).then(() => {
      props.onSubmit(selected, amount)
    }).catch(err => {
      console.error(err)
      alert('Failed to add ingredient.')
    })
  }

  return (
    <>
      <LoadingSpinner status={status} />
      {status === 'done' && (
        <form onSubmit={onSubmit}>
          <label>Ingredient:
            <Combobox value={selected} onChange={setSelected}>
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
          </label><br />

          <label>Amount: <input
            type='number'
            min={0}
            onChange={event => { setAmount(Number.parseFloat(event.target.value)) }}
            className='w-1/2'
            required
          /></label><br />

          <button type='submit' className='bg-savoy_blue-400 rounded'>Submit</button>
        </form>
      )}
    </>
  )
}
