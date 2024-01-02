import express from 'express'

import ChefDatabaseImpl from '../../database/ChefDatabaseImpl'
import SqliteConnection from '../../database/SqliteConnection'
import registerEndpoints from '../../api/registerEndpoints'

/**
 * Helper to create the app for testing
 */
export default function createTestApp (): express.Application {
  const connection = new SqliteConnection(':memory:')
  const db = new ChefDatabaseImpl(connection)
  db.resetDatabase('IKnowWhatIAmDoing')
  const app = express()
  registerEndpoints(app, db)
  return app
}
