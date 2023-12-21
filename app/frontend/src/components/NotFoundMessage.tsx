import { Link } from 'react-router-dom'
import React from 'react'

/**
 * 404 page that is displayed when a route is not found or requested data does not exist.
 */
export default function NotFoundMessage (): React.JSX.Element {
  return (
    <main>
      <h1>404: Page Not Found</h1>
      <p>The page you requested was not found.</p>
      <Link to='/'>Return to the home page</Link>
    </main>
  )
}
