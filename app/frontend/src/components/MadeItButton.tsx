import { mdiHamburger, mdiHamburgerCheck } from '@mdi/js'
import Icon from '@mdi/react'
import React from 'react'
import { ThreeDots } from 'react-loader-spinner'

import apiClient from '../apiClient'
import monitorStatus from '../utils/monitorStatus'

import LoadingSpinner, { type LoadingStatus } from './LoadingSpinner'

export interface MadeItButtonProps {
  recipeId: number
}

/**
 * Button to deduct ingredients from fridge after making a recipe.
 * Used on RecipePage. Split for readability.
 */
export default function MadeItButton (props: MadeItButtonProps): React.JSX.Element {
  const [madeItStatus, setMadeItStatus] = React.useState<LoadingStatus>('notstarted')

  function handleClick (): void {
    apiClient.POST(
      '/fridge/{fridgeId}/recipe/{recipeId}/deduct',
      { params: { path: { fridgeId: 1, recipeId: props.recipeId } } }
    ).then(
      monitorStatus(setMadeItStatus)
    ).catch(err => {
      console.error(err)
    })
  }

  return (
    <button onClick={handleClick} disabled={madeItStatus === 'loading' || madeItStatus === 'done'}>
      <Icon path={madeItStatus === 'done' ? mdiHamburgerCheck : mdiHamburger} size={1} className='inline' />
      {/** Render a space between the icon and the text. */}
      {' '}
      Made it - Remove Ingredients From Fridge
      <LoadingSpinner
        status={madeItStatus}
        spinner={<ThreeDots width={32} height={16} wrapperClass='inline' />}
      />
    </button>
  )
}
