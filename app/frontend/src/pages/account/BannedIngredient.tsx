import React from 'react'

import LoadingSpinner, { DefaultSmallError, DefaultSmallSpinner, type LoadingStatus } from '../../components/LoadingSpinner'
import monitorStatus, { type ApiError } from '../../utils/monitorStatus'
import UserContext from '../../contexts/UserContext'
import apiClient from '../../apiClient'

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
        }
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
