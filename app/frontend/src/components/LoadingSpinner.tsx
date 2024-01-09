import { InfinitySpin, ThreeDots } from 'react-loader-spinner'
import Icon from '@mdi/react'
import React from 'react'
import { mdiAlert } from '@mdi/js'

/**
 * Status of a loading operation.
 *
 * - `notstarted`: The operation has not started yet.
 *   Functionally equivalent to `done`, but can be used for clarity.
 * - `loading`: The operation is currently loading.
 *   The spinner will be shown.
 * - `done`: The operation has finished successfully.
 *   Nothing will be shown.
 * - `error`: The operation has finished with an error.
 *   An error message will be shown.
 */
export type LoadingStatus =
  | 'notstarted'
  | 'loading'
  | 'done'
  | 'error'

export const DefaultSpinner = <InfinitySpin />
export const DefaultSmallSpinner = <ThreeDots width={32} height={16} wrapperClass='inline' />

export interface LoadingSpinnerProps {
  /**
   * Class name to apply to the outer div.
   * @default 'flex justify-center'
   */
  className?: string
  status: LoadingStatus
  /** The spinner to show while loading. Defaults to InfinitySpin from react-loader-spinner. */
  spinner?: React.JSX.Element
}

/**
 * Get the highest status from a list of statuses.
 * Order of precedence: error > loading > done > notstarted.
 */
export function getHighestStatus (statuses: LoadingStatus[]): LoadingStatus {
  if (statuses.includes('error')) {
    return 'error'
  } else if (statuses.includes('loading')) {
    return 'loading'
  } else if (statuses.includes('done')) {
    return 'done'
  } else {
    return 'notstarted'
  }
}

function getSpinner (props: LoadingSpinnerProps): React.JSX.Element | null {
  switch (props.status) {
    case 'loading':
      return props.spinner ?? DefaultSpinner
    case 'notstarted':
    case 'done':
      return null
    case 'error':
      // TODO: Better way to show error?
      // TODO: Modal with error message and helper function to create modal or spinner based on status?
      return (
        <p className='text-red-500'>
          <Icon path={mdiAlert} size={1} className='inline' />
          An error occurred. Please check the console for details.
        </p>
      )
  }
}

/**
 * Component to visualize the loading status of a page.
 * Shows a spinner while loading, nothing when done, and an error message when an error occurred.
 *
 * @see monitorStatus - Helper function to update a status that can be used with this component.
 */
export default function LoadingSpinner (props: LoadingSpinnerProps): React.JSX.Element {
  const className = props.className ?? 'flex justify-center'
  return <span className={className}>{getSpinner(props)}</span>
}
