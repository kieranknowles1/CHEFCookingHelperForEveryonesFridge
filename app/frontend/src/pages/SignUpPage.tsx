import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../components/LoadingSpinner'
import UserContext, { type UserState } from '../contexts/UserContext'
import apiClient from '../apiClient'
import handleApiError from '../utils/handleApiError'
import monitorOutcome from '../utils/monitorOutcome'

export interface SignUpPageProps {
  setUserState: (userState: UserState | null) => void
}

export default function SignUpPage (props: SignUpPageProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  const [username, setUsername] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')
  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')

  function handleSubmit (event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    apiClient.POST('/signup', {
      headers: new Headers({ Authorization: 'Basic ' + btoa(username + ':' + password) })
    }).then(
      monitorOutcome(setStatus)
    ).then(data => {
      props.setUserState(data)
    }).catch(err => {
      handleApiError(err, props.setUserState)
    }).finally(() => {
      setUsername('')
      setPassword('')
    })
  }

  if (context !== null) {
    return (
      <main>
        <h1>Sign Up</h1>
        <p>You are already logged in.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label>Username: <input
          type='text'
          value={username}
          onChange={event => { setUsername(event.target.value) }}
          required
        /></label><br/>
        <label>Password: <input
          type='password'
          value={password}
          onChange={event => { setPassword(event.target.value) }}
          required
        /></label><br/>

        <button type='submit' className='bg-raisin_black-600'>Sign Up</button>
        <LoadingSpinner status={status} />
      </form>
    </main>
  )
}
