import React from 'react'
import { Combobox } from '@headlessui/react'

import apiClient from '../apiClient'
import { type components } from '../types/api.generated'

import LoadingSpinner, { type LoadingStatus } from './LoadingSpinner'

type Ingredient = components['schemas']['Ingredient']

// TODO: Implement
export default function AddIngredient (): React.JSX.Element {
  const [status, setStatus] = React.useState<LoadingStatus>('loading')
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([])

  const [selected, setSelected] = React.useState<Ingredient | null>(null)
  const [amount, setAmount] = React.useState(0)

  const [filteredIngredients, setFilteredIngredients] = React.useState<Ingredient[]>([])
  const [query, setQuery] = React.useState('')

  React.useEffect(() => {
    apiClient.GET(
      '/ingredient/all'
    ).then(response => {
      if (response.data === undefined) {
        throw new Error(response.error)
      }
      setIngredients(response.data.filter(
        ingredient => !ingredient.assumeUnlimited
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

    // TODO: Send request to server
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
            className='w-1/2 bg-raisin_black-800 text-citron-100'
            required
          /></label><br />

          <button type='submit' className='bg-savoy_blue-400 rounded'>Submit</button>
        </form>
      )}
    </>
  )
}
