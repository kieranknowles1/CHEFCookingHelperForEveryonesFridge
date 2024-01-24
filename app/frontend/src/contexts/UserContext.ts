import { createContext } from 'react'

import { type components } from '../types/api.generated'

type BasicFridge = components['schemas']['BasicFridge']

export interface UserState {
  token: string
  userId: number
  fridge?: BasicFridge
}

/**
 * Global state about the logged in user
*/
const UserContext = createContext<UserState | null>(null)
export default UserContext
