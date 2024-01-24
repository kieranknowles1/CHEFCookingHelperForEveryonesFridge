import type http from 'http'

import type IChefDatabase from '../../database/IChefDatabase'
import type IConnection from '../../database/IConnection'
import createApp from '../../createApp'
import createTestDatabase from '../database/createTestDatabase'
import issueToken from '../../utils/issueToken'

export interface TestApp {
  server: http.Server
  connection: IConnection
  db: IChefDatabase
  authHeaderValue: string
}

/**
 * Helper to create the app for testing
 */
export default function createTestApp (): TestApp {
  const { database, connection } = createTestDatabase()
  const app = createApp(database, {
    // Will throw 500 if a response is not valid. Saves having to write an io-ts validator for every response.
    validateResponses: true
  })
  const server = app.listen()
  return {
    server,
    connection,
    db: database,
    authHeaderValue: `Bearer ${issueToken(1)}`
  }
}
