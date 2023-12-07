import { Dialog } from '@headlessui/react'
import React from 'react'

import FridgeIngredient, { type FridgeIngredientProps } from '../components/FridgeIngredient'
import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import AddIngredient from '../components/AddIngredient'
import ModalDialog from '../components/ModalDialog'
import apiClient from '../apiClient'

const ScanBarcode = React.lazy(async () => await import('../components/ScanBarcode'))

// TODO: Implement
export default function MyFridgePage (): React.JSX.Element {
  // TODO: Helper function to update status
  const [status, setStatus] = React.useState<LoadingStatus>('loading')
  const [ingredients, setIngredients] = React.useState<FridgeIngredientProps[]>([])

  const [addIngredientOpen, setAddingredientOpen] = React.useState(false)
  const [scanBarcodeOpen, setScanBarcodeOpen] = React.useState(false)

  function fetchIngredients (): void {
    setStatus('loading')
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
  }

  React.useEffect(fetchIngredients, [])

  return (
    <main>
      <h1>My Fridge</h1>
      <button onClick={() => { setAddingredientOpen(true) } }>Add Ingredient</button>
      <ModalDialog
        open={addIngredientOpen}
        setOpen={setAddingredientOpen}
      >
        <Dialog.Title>Add New Ingredient</Dialog.Title>
        <AddIngredient
          currentIngredients={ingredients.map(i => i.ingredient)}
          onSubmit={() => {
            fetchIngredients()
            setAddingredientOpen(false)
          }}
        />
      </ModalDialog>

      <button onClick={() => { setScanBarcodeOpen(true) } }>Scan Barcode</button>
      <ModalDialog
        open={scanBarcodeOpen}
        setOpen={setScanBarcodeOpen}
      >
        <React.Suspense fallback={<LoadingSpinner status='loading' />}>
          <Dialog.Title>Scan Barcode</Dialog.Title>
          <ScanBarcode />
        </React.Suspense>
      </ModalDialog>

      <LoadingSpinner status={status} />
      <ul className='grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3'>
        {ingredients.map(ingredient =>
          <FridgeIngredient key={ingredient.ingredient.id} {...ingredient} />
        )}
      </ul>
    </main>
  )
}
