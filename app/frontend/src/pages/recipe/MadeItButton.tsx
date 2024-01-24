import { FaBurger } from 'react-icons/fa6'
import React from 'react'

import LoadingSpinner, { DefaultSmallSpinner, type LoadingStatus } from '../../components/LoadingSpinner'
import UserContext from '../../contexts/UserContext'
import apiClient, { createAuthHeaders } from '../../apiClient'
import monitorStatus from '../../utils/monitorStatus'

export interface MadeItButtonProps {
  recipeId: number
}

/**
 * Button to deduct ingredients from fridge after making a recipe.
 * Used on RecipePage. Split for readability.
 */
export default function MadeItButton (props: MadeItButtonProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')

  if (context === null) {
    return <p>Log in to track what you&apos;ve made!</p>
  }

  const handleClick = (): void => {
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
      monitorStatus(setStatus)
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
