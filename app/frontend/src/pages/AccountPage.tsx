import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'
import useSafeContext from '../contexts/useSafeContext'

type User = components['schemas']['User']

export default function AccountPage (): React.JSX.Element {
  const context = useSafeContext(UserContext)

  const [user, setUser] = React.useState<User>()
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    setStatus('loading')
    apiClient.GET(
      '/user/{userId}',
      { params: { path: { userId: context.userId } } }
    ).then(response => {
      if (response.data === undefined) {
        throw new Error(response.error.message)
      }
      setUser(response.data)
    }).catch(err => {
      console.error(err)
      setStatus('error')
    })
  }, [context.userId])

  return (
    <main>
      <LoadingSpinner status={status} />
      {user !== undefined &&
      <>
        <h1>Hello, {user.name}</h1>
      </>}
    </main>
  )
}
