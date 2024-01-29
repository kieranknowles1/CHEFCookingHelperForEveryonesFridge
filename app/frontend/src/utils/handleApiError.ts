import { ApiError } from '../types/ApiError'
import { type UserState } from '../contexts/UserContext'

type UserStateSetter = (state: UserState | null) => void

// Semaphore to prevent logout alerts from stacking up.
// Needed for pages with multiple API calls. E.g., the fridge page.
let alertVisible = false

/**
 * Function to handle API errors
 * Place in the catch block of your API call
 */
export default function handleApiError (error: unknown, setUserState: UserStateSetter): void {
  console.error(error)
  if (error instanceof ApiError && error.code === 401) {
    setUserState(null)

    if (!alertVisible) {
      alertVisible = true
      alert('Your session has expired. Please log in again.')
      alertVisible = false
    }
  }
}
