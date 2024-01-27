import React from 'react'

import LoadingSpinner, { DefaultSmallError, DefaultSmallSpinner, type LoadingStatus } from '../../components/LoadingSpinner'
import apiClient, { createAuthHeaders } from '../../apiClient'
import { type ApiError } from '../../types/ApiError'
import UserContext from '../../contexts/UserContext'
import monitorStatus from '../../utils/monitorStatus'

export interface BannedIngredientProps {
  name: string
  id: number
  onRemove: () => void
}

export default function BannedIngredient (props: BannedIngredientProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  if (context === null) {
    throw new Error('UserContext was null')
  }

  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')

  const handleRemove = (): void => {
    apiClient.POST(
      '/user/{userId}/preference/ingredient/{ingredientId}',
      {
        params: {
          path: { userId: context.userId, ingredientId: props.id },
          query: { allow: true }
        },
        headers: createAuthHeaders(context)
      }
    ).then(
      monitorStatus(setStatus)
    ).then(() => {
      props.onRemove()
    }).catch((err: ApiError) => {
      console.error(err)
      alert(err.message)
    })
  }

  return (
    <li>
      {props.name} <button onClick={handleRemove}>Allow</button>
      <LoadingSpinner
        className='inline-block'
        status={status}
        spinner={DefaultSmallSpinner}
        errorMessage={DefaultSmallError}
      />
    </li>
  )
}
