import createClient, { FetchOptions } from 'openapi-fetch'

import { type paths } from './types/api.generated'
import { UserState } from './contexts/UserContext'

const client = createClient<paths>({
  baseUrl: window.config.API_BASE_URL
})

export type Client = typeof client

export default client

export function createAuthHeaders(user: UserState): Headers {
  return new Headers({
    Authorization: `Bearer ${user.token}`
  })
}
