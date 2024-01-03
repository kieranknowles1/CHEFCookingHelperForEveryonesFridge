import type http from 'http'

import express from 'express'

import ChefDatabaseImpl from '../../database/ChefDatabaseImpl'
import type IChefDatabase from '../../database/IChefDatabase'
import type IConnection from '../../database/IConnection'
import SqliteConnection from '../../database/SqliteConnection'
import registerEndpoints from '../../api/registerEndpoints'

export interface TestApp {
  server: http.Server
  connection: IConnection
  db: IChefDatabase
}

/**
 * Helper to create the app for testing
 */
export default function createTestApp (): TestApp {
  const connection = new SqliteConnection(':memory:')
  const db = new ChefDatabaseImpl(connection)
  db.resetDatabase('IKnowWhatIAmDoing')
  const app = express()
  registerEndpoints(app, db)
  const server = app.listen()
  return {
    server,
    connection,
    db
  }
}
