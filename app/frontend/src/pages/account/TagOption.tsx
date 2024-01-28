import React from 'react'

import LoadingSpinner, { DefaultSmallError, DefaultSmallSpinner, type LoadingStatus } from '../../components/LoadingSpinner'
import apiClient, { createAuthHeaders } from '../../apiClient'
import { type ApiError } from '../../types/ApiError'
import ToggleButton from '../../components/inputs/ToggleButton'
import UserContext from '../../contexts/UserContext'
import monitorOutcome from '../../utils/monitorOutcome'

export interface TagOptionProps {
  name: string
  id: number
  description: string
  allowed: boolean
  // Function to call after submitting and when the API call succeeds
  onChange: (allowed: boolean) => void
}

export default function TagOption (props: TagOptionProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  if (context === null) {
    throw new Error('UserContext is null')
  }

  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')

  const setAllowed = (allowed: boolean): void => {
    apiClient.POST(
      '/user/{userId}/preference/tag/{tagId}',
      {
        params: { path: { userId: context.userId, tagId: props.id }, query: { allow: allowed } },
        headers: createAuthHeaders(context)
      }
    ).then(
      monitorOutcome(setStatus)
    ).then(() => {
      props.onChange(allowed)
    }).catch((err: ApiError) => {
      console.error(err)
      alert(err.message)
    })
  }

  return (
    <li>
      <ToggleButton
        checked={props.allowed}
        setChecked={setAllowed}
        screenReaderLabel={`Toggle ${props.name} as a dietary restriction`}
      />
      {' '}{props.name}: {props.description}. {props.allowed ? <span className='text-citron-400'>Allowed</span> : <span className='text-dim_gray-800'>Disallowed</span>}
      <LoadingSpinner
        className='inline-flex'
        status={status}
        spinner={DefaultSmallSpinner}
        errorMessage={DefaultSmallError}
      />
    </li>
  )
}
