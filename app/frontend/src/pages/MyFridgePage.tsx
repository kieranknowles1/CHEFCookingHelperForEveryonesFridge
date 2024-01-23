import { Dialog } from '@headlessui/react'
import { Link } from 'react-router-dom'
import React from 'react'

import LoadingSpinner, { type LoadingStatus, getHighestStatus } from '../components/LoadingSpinner'
import ModalDialog from '../components/ModalDialog'
import NeedsLoginPage from '../errorpages/NeedsLoginPage'
import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'
import monitorStatus from '../utils/monitorStatus'

import AddIngredient from './myfridge/AddIngredient'
import FridgeIngredient from './myfridge/FridgeIngredient'

const ScanBarcode = React.lazy(async () => await import('./myfridge/ScanBarcode'))

type FridgeIngredientEntry = components['schemas']['FridgeIngredientEntry']

export default function MyFridgePage (): React.JSX.Element {
  const context = React.useContext(UserContext)

  const [ingredientsStatus, setIngredientsStatus] = React.useState<LoadingStatus>('loading')
  const [ingredients, setIngredients] = React.useState<FridgeIngredientEntry[]>([])

  // Placeholder to show something while the name is loading
  const [fridgeName, setFridgeName] = React.useState('My Fridge')
  const [fridgeNameStatus, setFridgeNameStatus] = React.useState<LoadingStatus>('loading')

  const [addIngredientOpen, setAddingredientOpen] = React.useState(false)
  const [scanBarcodeOpen, setScanBarcodeOpen] = React.useState(false)

  if (context === null) {
    return <NeedsLoginPage />
  }

  React.useEffect(() => {
    apiClient.GET(
      '/fridge/{fridgeId}',
      { params: { path: { fridgeId: context.fridgeId } } }
    ).then(
      monitorStatus(setFridgeNameStatus)
    ).then(data => {
      setFridgeName(data.name)
    }).catch(err => {
      console.error(err)
    })
  }, [context.fridgeId])

  const fetchIngredients = (): void => {
    apiClient.GET(
      '/fridge/{fridgeId}/ingredient/all/amount',
      { params: { path: { fridgeId: context.fridgeId } } }
    ).then(
      monitorStatus(setIngredientsStatus)
    ).then(data => {
      setIngredients(data)
    }).catch(err => {
      console.error(err)
    })
  }

  React.useEffect(fetchIngredients, [context.fridgeId])

  return (
    <main>
      <h1>{fridgeName}</h1>
      <LoadingSpinner status={getHighestStatus([ingredientsStatus, fridgeNameStatus])} />
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

      <ul className='grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3'>
        {ingredients.map(ingredient =>
          <FridgeIngredient key={ingredient.ingredient.id} {...ingredient} onEditAmount={fetchIngredients} />
        )}
      </ul>

      <Link to='/findrecipes'>What can I make?</Link>
    </main>
  )
}
