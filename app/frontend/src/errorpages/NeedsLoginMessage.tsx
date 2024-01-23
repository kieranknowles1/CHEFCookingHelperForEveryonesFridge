import { Link } from 'react-router-dom'
import React from 'react'

/**
 * Page to display when a user needs to login to view a page.
 */
export default function NeedsLoginMessage (): React.JSX.Element {
  return (
    <main>
      <h1>Login Required</h1>
      <p>Please log in to view this page.</p>
      <Link to='/'>Return to the home page</Link>
    </main>
  )
}
