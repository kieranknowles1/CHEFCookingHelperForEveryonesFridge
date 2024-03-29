import React from 'react'

import LoadingSpinner, { DefaultSmallError, DefaultSmallSpinner, type LoadingStatus } from '../../components/LoadingSpinner'
import UserContext, { type UserState } from '../../contexts/UserContext'
import apiClient, { createAuthHeaders } from '../../apiClient'
import { type ApiError } from '../../types/ApiError'
import monitorOutcome from '../../utils/monitorOutcome'

export interface BannedIngredientProps {
  name: string
  id: number
  onRemove: () => void
  setUserState: (userState: UserState | null) => void
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
      monitorOutcome(setStatus, props.setUserState)
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
