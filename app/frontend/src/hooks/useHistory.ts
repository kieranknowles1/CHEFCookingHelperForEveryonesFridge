import React from 'react'

import apiClient, { createAuthHeaders } from '../apiClient'
import { type LoadingStatus } from '../components/LoadingSpinner'
import { type UserState } from '../contexts/UserContext'
import { type components } from '../types/api.generated'
import monitorOutcome from '../utils/monitorOutcome'

type MadeRecipe = components['schemas']['MadeRecipe']

/**
 * Hook to get a user's history of made recipes.
 */
export default function useHistory (
  userId: number,
  recipeId: number | undefined,
  userState: UserState,
  setUserState: (userState: UserState | null) => void
): [MadeRecipe[], LoadingStatus] {
  const [history, setHistory] = React.useState<MadeRecipe[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    apiClient.GET(
      '/user/{userId}/history',
      {
        params: {
          path: { userId },
          query: recipeId !== undefined ? { recipe: recipeId } : {}
        },
        headers: createAuthHeaders(userState)
      }
    ).then(
      monitorOutcome(setStatus, setUserState)
    ).then(data => {
      setHistory(data)
    }).catch(err => {
      console.error(err)
    })
  }, [userId, recipeId, userState])

  return [history, status]
}
