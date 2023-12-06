import React from 'react'

import FridgeIngredient, { type FridgeIngredientProps } from '../components/FridgeIngredient'
import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import apiClient from '../apiClient'

import { useZxing } from 'react-zxing'

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

  // TODO: Move barcode to component. I've spent 2 hours looking for a library so cant be bothered to finish this
  const [result, setResult] = React.useState('')
  const { ref } = useZxing({
    onDecodeResult (res) {
      setResult(res.getText())
    }
  })

  return (
    <main>
      <video ref={ref}/>
      <p>{result}</p>
      <h1>My Fridge</h1>
      <LoadingSpinner status={status} />
      <ul className='grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3'>
        {ingredients.map(ingredient =>
          <FridgeIngredient key={ingredient.ingredient.id} {...ingredient} />
        )}
      </ul>
    </main>
  )
}
