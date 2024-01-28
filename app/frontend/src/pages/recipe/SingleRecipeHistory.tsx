import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../../components/LoadingSpinner'
import apiClient, { createAuthHeaders } from '../../apiClient'
import UserContext from '../../contexts/UserContext'
import { type components } from '../../types/api.generated'
import formatShortDate from '../../utils/formatShortDate'
import monitorOutcome from '../../utils/monitorOutcome'

type MadeRecipe = components['schemas']['MadeRecipe']

export interface SingleRecipeHistoryProps {
  userId: number
  recipeId: number
}

// If a user has made a recipe more than this many times, say "many times" instead of the number.
const LIMIT = 50

function getTimesMadeString (timesMade: number): string {
  if (timesMade > LIMIT) {
    return 'many times'
  } else if (timesMade === 1) {
    return 'once'
  } else {
    return `${timesMade} times`
  }
}

/**
 * Component for showing a user's history for a specific recipe.
 * Information is only meaningful if the recipe name is shown elsewhere on the page.
 */
export default function SingleRecipeHistory (props: SingleRecipeHistoryProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  if (context === null) {
    throw new Error('UserContext is null')
  }

  const [history, setHistory] = React.useState<MadeRecipe[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    apiClient.GET(
      '/user/{userId}/history',
      {
        params: {
          path: { userId: props.userId },
          query: { recipe: props.recipeId, limit: LIMIT }
        },
        headers: createAuthHeaders(context)
      }
    ).then(
      monitorOutcome(setStatus)
    ).then(data => {
      setHistory(data)
    }).catch(err => {
      console.error(err)
    })
  }, [props.userId, props.recipeId])

  if (status !== 'done') {
    return <LoadingSpinner status={status} className='' />
  }

  if (history.length === 0) {
    return <p>You have never made this recipe before.</p>
  }

  return (
    <p>
      You have made this recipe {getTimesMadeString(history.length)} before.
      Last made on {formatShortDate(new Date(history[0].dateMade))}.
    </p>
  )
}
