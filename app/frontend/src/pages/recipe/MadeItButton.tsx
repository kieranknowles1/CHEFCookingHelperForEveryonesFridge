import { FaBurger } from 'react-icons/fa6'
import React from 'react'

import LoadingSpinner, { DefaultSmallSpinner, type LoadingStatus } from '../../components/LoadingSpinner'
import UserContext, { type UserState } from '../../contexts/UserContext'
import apiClient, { createAuthHeaders } from '../../apiClient'
import monitorOutcome from '../../utils/monitorOutcome'

export interface MadeItButtonProps {
  recipeId: number
  setUserState: (userState: UserState | null) => void
}

/**
 * Button to deduct ingredients from fridge after making a recipe.
 * Used on RecipePage. Split for readability.
 */
export default function MadeItButton (props: MadeItButtonProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')

  if (context?.fridgeId === undefined) {
    return <p>Log in and select a fridge to track what you&apos;ve made!</p>
  }

  const handleClick = (): void => {
    if (context.fridgeId === undefined) {
      alert('Please select a fridge first')
      return
    }

    apiClient.POST(
      '/fridge/{fridgeId}/recipe/{recipeId}/maderecipe',
      {
        params: {
          path: { fridgeId: context.fridgeId, recipeId: props.recipeId },
          query: { users: [context.userId] }
        },
        headers: createAuthHeaders(context)
      }
    ).then(
      monitorOutcome(setStatus, props.setUserState)
    ).catch(err => {
      console.error(err)
    })
  }

  const message = status === 'done' ? 'Removed Ingredients and added to History' : 'Made it - Remove Ingredients From Fridge'

  return (
    <button onClick={handleClick} disabled={status === 'loading' || status === 'done'}>
      <FaBurger size={24} className='inline' />
      {' ' + message}
      <LoadingSpinner
        status={status}
        spinner={DefaultSmallSpinner}
      />
    </button>
  )
}
