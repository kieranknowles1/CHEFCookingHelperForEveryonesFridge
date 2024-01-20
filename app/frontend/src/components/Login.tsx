import React from 'react'

import UserContext, { type UserState } from '../contexts/UserContext'

export interface LoginProps {
  className?: string
  setUserState: (user: UserState | null) => void
}

/**
 * Component for login/logout
 * Placed on the navbar
 */
export default function Login (props: LoginProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  function handleLogin (): void {
    // TODO: Actually log in and get a token for persistent login
    props.setUserState({
      userId: 1,
      fridgeId: 1
    })
  }

  function handleLogout (): void {
    // TODO: Flush any data that needs to be flushed
    props.setUserState(null)
  }

  const buttonStyle = 'bg-raisin_black-700 hover:bg-raisin_black-800 text-citron-700 rounded-none'

  return (
    <div className={props.className}>
      {context === null
        ? <button className={buttonStyle} onClick={handleLogin}>Log in</button>
        : <button className={buttonStyle} onClick={handleLogout}>Log out</button>
      }
    </div>
  )
}
