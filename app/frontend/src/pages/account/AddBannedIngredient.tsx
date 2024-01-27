import React from 'react'

import LoadingSpinner, { DefaultSmallError, DefaultSmallSpinner, type LoadingStatus } from '../../components/LoadingSpinner'
import apiClient, { createAuthHeaders } from '../../apiClient'
import { type ApiError } from '../../types/ApiError'
import { IngredientPicker } from '../../components/IngredientPicker'
import UserContext from '../../contexts/UserContext'
import { type components } from '../../types/api.generated'
import monitorStatus from '../../utils/monitorStatus'

type Ingredient = components['schemas']['Ingredient']

export interface AddBannedIngredientProps {
  currentBannedIngredients: Set<number>
  // Function to call after submitting and when the API call succeeds
  onSubmit: (ingredient: Ingredient) => void
}

export default function AddBannedIngredient (props: AddBannedIngredientProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  if (context === null) {
    throw new Error('UserContext is null')
  }

  const [selected, setSelected] = React.useState<Ingredient | null>(null)
  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')

  const onSubmit = (event: React.FormEvent): void => {
    event.preventDefault()

    if (selected === null) {
      alert('Please select an ingredient')
      return
    }

    apiClient.POST(
      '/user/{userId}/preference/ingredient/{ingredientId}',
      {
        params: {
          path: { userId: context.userId, ingredientId: selected.id },
          query: { allow: false }
        },
        headers: createAuthHeaders(context)
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
