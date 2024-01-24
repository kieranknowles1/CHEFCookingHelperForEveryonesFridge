import React from 'react'

import { type components } from '../types/api.generated'
import LoadingSpinner, { LoadingStatus } from './LoadingSpinner'
import UserContext from '../contexts/UserContext'
import apiClient, { createAuthHeaders } from '../apiClient'
import monitorStatus from '../utils/monitorStatus'

type BasicFridge = components['schemas']['BasicFridge']

export interface FridgePickerProps {
  selected?: BasicFridge
  setSelected: (fridge: BasicFridge) => void
}

/**
 * Component to select a fridge from a list.
 * Defaults to the first fridge in the list.
 * Selection is stored in the user's context.
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
      monitorStatus(setStatus)
    ).then(data => {
      setFridges(data)
    }).catch(console.error)
  }, [context])

  if (status !== 'done') {
    return <LoadingSpinner status={status} />
  }

  return (
    <select
      value={props.selected?.id ?? ''}
      onChange={event => {
        const fridge = fridges.find(fridge => fridge.id.toString() === event.target.value)
        if (fridge !== undefined) {
          props.setSelected(fridge)
        }
      }}
    >
      <option value='' disabled>Select a fridge</option>
      {fridges.map(fridge => (
        <option key={fridge.id} value={fridge.id}>{fridge.name}</option>
      ))}
    </select>
  )
}
