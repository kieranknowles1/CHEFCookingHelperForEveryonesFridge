import createClient from 'openapi-fetch'

import { type paths } from './types/api.generated'

const client = createClient<paths>({
  baseUrl: window.config.API_BASE_URL
})

export type Client = typeof client

export default client
