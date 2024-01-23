import React from 'react'

import UserContext, { type UserState } from '../contexts/UserContext'
import monitorStatus, { type ApiError } from '../utils/monitorStatus'
import apiClient from '../apiClient'

import LoadingSpinner, { DefaultSmallSpinner, DefaultTinyError, type LoadingStatus } from './LoadingSpinner'

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

  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')

  function handleLogin (e: React.FormEvent): void {
    e.preventDefault()

    apiClient.POST(
      '/login',
      { headers: new Headers({ Authorization: 'Basic ' + btoa(username + ':' + password) }) }
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      // TODO: Store token in local storage
      // TODO: Have a way of selecting which fridge to use

      props.setUserState({
        token: data.token,
        userId: data.userId,
        // TODO: Add fridgeId
        fridgeId: 1
      })
    }).catch((err: ApiError) => {
      console.error(err)
      alert(`Could not log in: ${err.message}`)
    })
  }

  function handleLogout (): void {
    // TODO: Flush any data that needs to be flushed
    props.setUserState(null)
  }

  const buttonStyle = 'bg-raisin_black-700 hover:bg-raisin_black-800 text-citron-700 rounded-none'

  // return <></>
  return (
    <div className={props.className}>
      {context === null
        ? <form onSubmit={handleLogin} className='flex'>
            <LoadingSpinner
              status={status}
              spinner={DefaultSmallSpinner}
              errorMessage={DefaultTinyError}
              className='inline-block'
            />
            <label>Username: <input type='text' onChange={e => { setUsername(e.target.value) }} /></label>{' '}
            <label>Password: <input type='password' onChange={e => { setPassword(e.target.value) }} /></label>{' '}
            <button type='submit' className={buttonStyle}>
              Log in
            </button>
          </form>
        : <button className={buttonStyle} onClick={handleLogout}>Log out</button>
      }
    </div>
  )
}
