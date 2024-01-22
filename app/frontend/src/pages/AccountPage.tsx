import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import { type components } from '../types/api.generated'
import monitorStatus from '../utils/monitorStatus'
import useSafeContext from '../contexts/useSafeContext'

import History from './account/History'
import UserPreferences from './account/UserPreferences'

type User = components['schemas']['User']

export default function AccountPage (): React.JSX.Element {
  const context = useSafeContext(UserContext)

  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  const [userName, setUserName] = React.useState<string>()
  const [bannedTags, setBannedTags] = React.useState<User['bannedTags']>([])
  const [bannedIngredients, setBannedIngredients] = React.useState<User['bannedIngredients']>([])

  React.useEffect(() => {
    apiClient.GET(
      '/user/{userId}',
      { params: { path: { userId: context.userId } } }
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      setUserName(data.name)
      setBannedTags(data.bannedTags)
      setBannedIngredients(data.bannedIngredients)
    }).catch(err => {
      console.error(err)
    })
  }, [context.userId])

  if (status !== 'done') {
    return <LoadingSpinner status={status} />
  }

  return (
    <main>
      <h1>Hello, {userName}</h1>
      <h2>Your dislikes</h2>
      <UserPreferences
        userId={context.userId}
        bannedTags={bannedTags}
        setBannedTags={setBannedTags}
        bannedIngredients={bannedIngredients}
        setBannedIngredients={setBannedIngredients}
      />
      <h2>Your recent activity</h2>
      <History userId={context.userId} />
    </main>
  )
}
