import React from 'react'

import UserContext, { type UserState } from '../contexts/UserContext'
import apiClient, { createAuthHeaders } from '../apiClient'
import { type components } from '../types/api.generated'
import monitorOutcome from '../utils/monitorOutcome'

import LoadingSpinner, { type LoadingStatus } from './LoadingSpinner'

type BasicFridge = components['schemas']['BasicFridge']

export interface FridgePickerProps {
  setUserState: (userState: UserState) => void
}

/**
 * Component to select a fridge from a list.
 * Defaults to the first fridge in the list.
 * Selection is stored in the user's context for persistence and can only be accessed through the context.
 */
export function FridgePicker (props: FridgePickerProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  if (context === null) {
    throw new Error('UserContext is null')
  }

  const [fridges, setFridges] = React.useState<BasicFridge[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    apiClient.GET('/user/{userId}/fridges', {
      params: { path: { userId: context.userId } },
      headers: createAuthHeaders(context)
    }).then(
      monitorOutcome(setStatus)
    ).then(data => {
      setFridges(data)
    }).catch(console.error)
  }, [context])

  if (status !== 'done') {
    return <LoadingSpinner status={status} />
  }

  return (
    <select
      value={context.fridgeId ?? ''}
      onChange={event => {
        const fridge = fridges.find(fridge => fridge.id.toString() === event.target.value)
        // Will be undefined if selected value is none
        props.setUserState({ ...context, fridgeId: fridge?.id })
      }}
    >
      <option value=''>None</option>
      {fridges.map(fridge => (
        <option key={fridge.id} value={fridge.id}>{fridge.name}</option>
      ))}
    </select>
  )
}
