import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import UserContext, { type UserState } from '../contexts/UserContext'
import apiClient, { createAuthHeaders } from '../apiClient'
import NeedsLoginMessage from '../errorpages/NeedsLoginMessage'
import { type components } from '../types/api.generated'
import monitorOutcome from '../utils/monitorOutcome'

import History from './account/History'
import UserPreferences from './account/UserPreferences'

type User = components['schemas']['User']

export interface AccountPageProps {
  setUserState: (userState: UserState | null) => void
}

export default function AccountPage (props: AccountPageProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  const [userName, setUserName] = React.useState<string>()
  const [bannedTags, setBannedTags] = React.useState<User['bannedTags']>([])
  const [bannedIngredients, setBannedIngredients] = React.useState<User['bannedIngredients']>([])

  React.useEffect(() => {
    if (context === null) {
      return
    }
    apiClient.GET(
      '/user/{userId}',
      {
        params: { path: { userId: context.userId } },
        headers: createAuthHeaders(context)
      }
    ).then(
      monitorOutcome(setStatus, props.setUserState)
    ).then(data => {
      setUserName(data.name)
      setBannedTags(data.bannedTags)
      setBannedIngredients(data.bannedIngredients)
    }).catch(err => {
      console.error(err)
    })
  }, [context])

  if (context === null) {
    return <NeedsLoginMessage />
  }
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
        setUserState={props.setUserState}
      />
      <h2>Your recent activity</h2>
      <History userId={context.userId} setUserState={props.setUserState} />
    </main>
  )
}
