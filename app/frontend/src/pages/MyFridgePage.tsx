import { Dialog } from '@headlessui/react'
import { Link } from 'react-router-dom'
import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import UserContext, { type UserState } from '../contexts/UserContext'
import apiClient, { createAuthHeaders } from '../apiClient'
import { FridgePicker } from '../components/FridgePicker'
import ModalDialog from '../components/ModalDialog'
import NeedsLoginMessage from '../errorpages/NeedsLoginMessage'
import { type components } from '../types/api.generated'
import handleApiError from '../utils/handleApiError'
import monitorOutcome from '../utils/monitorOutcome'

import AddIngredient from './myfridge/AddIngredient'
import FridgeIngredient from './myfridge/FridgeIngredient'

const ScanBarcode = React.lazy(async () => await import('./myfridge/ScanBarcode'))

type FridgeIngredientEntry = components['schemas']['FridgeIngredientEntry']

interface MyFridgePageProps {
  setUserState: (userState: UserState | null) => void
}

export default function MyFridgePage (props: MyFridgePageProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  const [ingredients, setIngredients] = React.useState<FridgeIngredientEntry[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')

  const [addIngredientOpen, setAddingredientOpen] = React.useState(false)
  const [scanBarcodeOpen, setScanBarcodeOpen] = React.useState(false)

  const [fridgeName, setFridgeName] = React.useState('My Fridge')
  React.useEffect(() => {
    if (context?.fridgeId === undefined) {
      setFridgeName('My Fridge')
      return
    }
    apiClient.GET('/fridge/{fridgeId}',
      {
        params: { path: { fridgeId: context.fridgeId } },
        headers: createAuthHeaders(context)
      }
    ).then(
      // Don't particularly care if this fails
      monitorOutcome(() => {}, props.setUserState)
    ).then(data => {
      setFridgeName(data.name)
    }).catch(err => {
      handleApiError(err, props.setUserState)
      setFridgeName('My Fridge')
    })
  }, [context?.fridgeId])

  const fetchIngredients = (): void => {
    if (context?.fridgeId === undefined) {
      return
    }
    apiClient.GET(
      '/fridge/{fridgeId}/ingredient/all/amount',
      {
        params: { path: { fridgeId: context.fridgeId } },
        headers: createAuthHeaders(context)
      }
    ).then(
      monitorOutcome(setStatus, props.setUserState)
    ).then(data => {
      setIngredients(data)
    }).catch(err => {
      console.error(err)
    })
  }

  React.useEffect(fetchIngredients, [context])

  if (context === null) {
    return <NeedsLoginMessage />
  }

  const picker = (
    <label>Fridge: <FridgePicker
      setUserState={props.setUserState}
    /></label>
  )

  if (context.fridgeId === undefined) {
    return (
      <main>
        {picker}
        <h1>Select a fridge</h1>
      </main>
    )
  }

  return (
    <main>
      {picker}
      <h1>{fridgeName}</h1>
      <LoadingSpinner status={status} />
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
      {status === 'done' && ingredients.length === 0 && <p>Your fridge is empty!</p>}

      <Link to='/findrecipes'>What can I make?</Link>
    </main>
  )
}
