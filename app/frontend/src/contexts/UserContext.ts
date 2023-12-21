import { createContext } from 'react'

export interface UserState {
  userId: number
  fridgeId: number
}

/**
 * Global state about the logged in user
*/
const UserContext = createContext<UserState | null>(null)
export default UserContext
