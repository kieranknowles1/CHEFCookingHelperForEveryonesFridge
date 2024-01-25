import createClient from 'openapi-fetch'

import { type UserState } from './contexts/UserContext'
import { type paths } from './types/api.generated'

const client = createClient<paths>({
  baseUrl: window.config.API_BASE_URL
})

export type Client = typeof client

export default client

export function createAuthHeaders (user: UserState): Headers {
  return new Headers({
    Authorization: `Bearer ${user.token}`
  })
}
