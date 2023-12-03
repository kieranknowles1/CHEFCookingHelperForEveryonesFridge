import { InfinitySpin } from 'react-loader-spinner'
import React from 'react'

export type LoadingStatus = 'loading' | 'done' | 'error'

export interface LoadingSpinnerProps {
  status: LoadingStatus
}

function getSpinner (status: LoadingStatus): React.JSX.Element | null {
  switch (status) {
    case 'loading':
      return <InfinitySpin />
    case 'done':
      return null
    case 'error':
      // TODO: Better way to show error?
      return <p>An error occurred. Please check the console for details.</p>
  }
}

export default function LoadingSpinner (props: LoadingSpinnerProps): React.JSX.Element {
  return <div className='flex justify-center'>{getSpinner(props.status)}</div>
}
