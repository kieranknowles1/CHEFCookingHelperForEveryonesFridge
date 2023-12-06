import { Popover } from '@headlessui/react'
import React from 'react'

import FridgeIngredient, { type FridgeIngredientProps } from '../components/FridgeIngredient'
import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import AddIngredient from '../components/AddIngredient'
import ScanBarcode from '../components/ScanBarcode'
import apiClient from '../apiClient'

// TODO: Implement
export default function MyFridgePage (): React.JSX.Element {
  // TODO: Helper function to update status
  const [status, setStatus] = React.useState<LoadingStatus>('loading')
  const [ingredients, setIngredients] = React.useState<FridgeIngredientProps[]>([])

  React.useEffect(() => {
    apiClient.GET(
      '/fridge/{fridgeId}/ingredient/all/amount',
      // TODO: Set fridge ID from the logged in user
      { params: { path: { fridgeId: 1 } } }
    ).then(response => {
      if (response.data === undefined) {
        throw new Error(response.error)
      }
      setIngredients(response.data)
      setStatus('done')
    }).catch(err => {
      console.error(err)
      setStatus('error')
    })
  }, [])

  return (
    <main>
      <h1>My Fridge</h1>
      {/* TODO: Buttons for these */}
      <AddIngredient />
      <ScanBarcode />
      <LoadingSpinner status={status} />
      <ul className='grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3'>
        {ingredients.map(ingredient =>
          <FridgeIngredient key={ingredient.ingredient.id} {...ingredient} />
        )}
      </ul>
    </main>
  )
}
