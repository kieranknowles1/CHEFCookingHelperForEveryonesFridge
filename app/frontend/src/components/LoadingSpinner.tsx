import { InfinitySpin } from 'react-loader-spinner'
import React from 'react'

export type LoadingStatus = 'loading' | 'done' | 'error'

export interface LoadingSpinnerProps {
  status: LoadingStatus
}

/**
 * Get the highest status from a list of statuses.
 * Order of precedence: error > loading > done
 */
export function getHighestStatus (statuses: LoadingStatus[]): LoadingStatus {
  if (statuses.includes('error')) {
    return 'error'
  } else if (statuses.includes('loading')) {
    return 'loading'
  } else {
    return 'done'
  }
}

function getSpinner (status: LoadingStatus): React.JSX.Element | null {
  switch (status) {
    case 'loading':
      return <InfinitySpin />
    case 'done':
      return null
    case 'error':
      // TODO: Better way to show error?
      // TODO: Modal with error message and helper function to create modal or spinner based on status?
      return <p>An error occurred. Please check the console for details.</p>
  }
}

/**
 * Component to visualize the loading status of a page.
 * Shows a spinner while loading, nothing when done, and an error message when an error occurred.
 *
 * @see monitorStatus - Helper function to update a status that can be used with this component.
 */
export default function LoadingSpinner (props: LoadingSpinnerProps): React.JSX.Element {
  return <div className='flex justify-center'>{getSpinner(props.status)}</div>
}
