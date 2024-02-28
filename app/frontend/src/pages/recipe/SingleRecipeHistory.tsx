import React from 'react'

import UserContext, { type UserState } from '../../contexts/UserContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import formatShortDate from '../../utils/formatShortDate'
import useHistory from '../../hooks/useHistory'

export interface SingleRecipeHistoryProps {
  userId: number
  recipeId: number
  setUserState: (userState: UserState | null) => void
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

  const [history, status] = useHistory(
    props.userId,
    props.recipeId,
    context,
    props.setUserState
  )

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
