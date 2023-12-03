import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'

// TODO: Implement
export default function MyFridgePage (): React.JSX.Element {
  // TODO: Helper function to update status
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  return (
    <main>
      <h1>My Fridge</h1>
      <LoadingSpinner status={status} />
    </main>
  )
}
