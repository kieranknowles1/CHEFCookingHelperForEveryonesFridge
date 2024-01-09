import type http from 'http'

import express from 'express'

import type IChefDatabase from '../../database/IChefDatabase'
import type IConnection from '../../database/IConnection'
import createTestDatabase from '../database/createTestDatabase'
import registerEndpoints from '../../api/registerEndpoints'

export interface TestApp {
  server: http.Server
  // TODO: May want to remove DB and connection from here
  connection: IConnection
  db: IChefDatabase
}

/**
 * Helper to create the app for testing
 */
export default function createTestApp (): TestApp {
  const { database, connection } = createTestDatabase()
  const app = express()
  registerEndpoints(app, database)
  const server = app.listen()
  return {
    server,
    connection,
    db: database
  }
}
