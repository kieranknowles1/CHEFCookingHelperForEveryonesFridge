import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import History from '../components/History'
import UserContext from '../contexts/UserContext'
import UserPreferences from '../components/UserPreferences'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'
import monitorStatus from '../utils/monitorStatus'
import useSafeContext from '../contexts/useSafeContext'

type User = components['schemas']['User']

export default function AccountPage (): React.JSX.Element {
  const context = useSafeContext(UserContext)

  const [user, setUser] = React.useState<User>()
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    apiClient.GET(
      '/user/{userId}',
      { params: { path: { userId: context.userId } } }
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      setUser(data)
    }).catch(err => {
      console.error(err)
    })
  }, [context.userId])

  if (user === undefined) {
    return <LoadingSpinner status={status} />
  }

  return (
    <main>
      <h1>Hello, {user.name}</h1>
      <h2>Your dislikes</h2>
      <UserPreferences
        userId={context.userId}
        bannedTags={user.bannedTags}
        bannedIngredients={user.bannedIngredients}
      />
      <h2>Your recent activity</h2>
      <History userId={context.userId} />
    </main>
  )
}
