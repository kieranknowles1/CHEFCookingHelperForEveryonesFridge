import createClient from 'openapi-fetch'

import { type paths } from './types/api.generated'

const client = createClient<paths>({
  // TODO: Env variable for baseUrl
  baseUrl: 'http://localhost:3000/api/v1'
})

export default client
