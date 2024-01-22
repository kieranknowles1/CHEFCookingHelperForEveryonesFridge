import React from 'react'

import LoadingSpinner, { DefaultSmallError, DefaultSmallSpinner, type LoadingStatus } from '../../components/LoadingSpinner'
import monitorStatus, { type ApiError } from '../../utils/monitorStatus'
import { IngredientPicker } from '../../components/IngredientPicker'
import apiClient from '../../apiClient'
import { type components } from '../../types/api.generated'

type Ingredient = components['schemas']['Ingredient']

export interface AddBannedIngredientProps {
  currentBannedIngredients: Set<number>
  // Function to call after submitting and when the API call succeeds
  onSubmit: (ingredient: Ingredient) => void
}

export default function AddBannedIngredient (props: AddBannedIngredientProps): React.JSX.Element {
  const [selected, setSelected] = React.useState<Ingredient | null>(null)
  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')

  function onSubmit (event: React.FormEvent): void {
    event.preventDefault()

    if (selected === null) {
      alert('Please select an ingredient')
      return
    }

    apiClient.POST(
      '/user/{userId}/preference/ingredient/{ingredientId}',
      {
        params: {
          path: { userId: 1, ingredientId: selected.id },
          query: { allow: false }
        }
      }
    ).then(
      monitorStatus(setStatus)
    ).then(() => {
      props.onSubmit(selected)
    }).catch((err: ApiError) => {
      console.error(err)
      alert(err.message)
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <label>Ingredient: <IngredientPicker
        excludedIds={props.currentBannedIngredients}
        selected={selected}
        setSelected={setSelected}
      /></label><br />

      <button type='submit' className='bg-savoy_blue-400 hover:bg-savoy_blue-500'>
        Add
      </button>
      <LoadingSpinner
        className='inline'
        status={status}
        spinner={DefaultSmallSpinner}
        errorMessage={DefaultSmallError}
      />
    </form>
  )
}
