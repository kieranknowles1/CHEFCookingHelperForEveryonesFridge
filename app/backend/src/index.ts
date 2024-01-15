import logger, { createDefaultLogger, setLogger } from './logger'
import ChefDatabaseImpl from './database/ChefDatabaseImpl'
import SqliteConnection from './database/SqliteConnection'
import createApp from './createApp'
import environment from './environment'
import { preloadModel } from './ml/getModel'

setLogger(createDefaultLogger(environment.RUNTIME_LOG_FILE))

const db = new ChefDatabaseImpl(new SqliteConnection(environment.DATABASE_PATH))

logger.info('Sanity checking database.')
// Make sure the database is in a good state.
try {
  db.checkIntegrity()
} catch (err) {
  logger.error('Database integrity check failed. Please analyse the logged error. Endpoints may fail or return incorrect data.')
  logger.caughtError(err)
}

// Get the model ready for when a ML endpoint is called
preloadModel().catch((err) => {
  logger.error('Failed to preload model. ML endpoints will not work.')
  logger.error('Will retry when the model is next requested.')
  logger.caughtError(err)
})

const app = createApp(db, {
  validateResponses: true
})

app.listen(environment.PORT, () => {
  logger.info(`Backend listening on http://localhost:${environment.PORT}`)
})
