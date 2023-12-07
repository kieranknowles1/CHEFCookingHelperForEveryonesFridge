import React from 'react'
import { Dialog, Popover } from '@headlessui/react'

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

  const [addIngredientOpen, setAddingredientOpen] = React.useState(false)

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
      <button onClick={() => { setAddingredientOpen(true) } }>Add Ingredient</button>
      <Dialog
        open={addIngredientOpen}
        onClose={() => { setAddingredientOpen(false) }}
        className='relative z-50'
      >
        {/** Backdrop */}
        <div className='fixed inset-0 bg-black/30' aria-hidden />
        <div className='fixed inset-0 w-screen h-screen items-center justify-center p-4'>
          <Dialog.Panel className='mx-auto max-w-lg rounded bg-raisin_black-700'>
            <Dialog.Title>Add Ingredient</Dialog.Title>
            <AddIngredient/>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/** <ScanBarcode/> */}
      <LoadingSpinner status={status} />
      <ul className='grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3'>
        {ingredients.map(ingredient =>
          <FridgeIngredient key={ingredient.ingredient.id} {...ingredient} />
        )}
      </ul>
    </main>
  )
}
