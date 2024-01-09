import { mdiHamburger, mdiHamburgerCheck } from '@mdi/js'
import Icon from '@mdi/react'
import React from 'react'

import UserContext from '../contexts/UserContext'
import apiClient from '../apiClient'
import monitorStatus from '../utils/monitorStatus'
import useSafeContext from '../contexts/useSafeContext'

import LoadingSpinner, { DefaultSmallSpinner, type LoadingStatus } from './LoadingSpinner'

export interface MadeItButtonProps {
  recipeId: number
}

/**
 * Button to deduct ingredients from fridge after making a recipe.
 * Used on RecipePage. Split for readability.
 */
export default function MadeItButton (props: MadeItButtonProps): React.JSX.Element {
  const context = useSafeContext(UserContext)

  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')

  function handleClick (): void {
    apiClient.POST(
      '/fridge/{fridgeId}/recipe/{recipeId}/maderecipe',
      {
        params: {
          path: { fridgeId: context.fridgeId, recipeId: props.recipeId },
          query: { users: [context.userId] }
        }
      }
    ).then(
      monitorStatus(setStatus)
    ).catch(err => {
      console.error(err)
    })
  }

  const message = status === 'done' ? 'Removed Ingredients and added to History' : 'Made it - Remove Ingredients From Fridge'
  const icon = status === 'done' ? mdiHamburgerCheck : mdiHamburger

  return (
    <button onClick={handleClick} disabled={status === 'loading' || status === 'done'}>
      <Icon path={icon} size={1} className='inline' />
      {' ' + message}
      <LoadingSpinner
        status={status}
        spinner={DefaultSmallSpinner}
      />
    </button>
  )
}
