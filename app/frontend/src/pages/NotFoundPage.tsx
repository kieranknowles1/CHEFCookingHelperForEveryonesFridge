import { Link } from 'react-router-dom'
import React from 'react'

/**
 * 404 page for the application
 */
export default function NotFoundPage (): React.JSX.Element {
  return (
    <main>
      <h1>404: Page Not Found</h1>
      <p>The page you requested was not found.</p>
      <Link to='/'>Return to the home page</Link>
    </main>
  )
}
