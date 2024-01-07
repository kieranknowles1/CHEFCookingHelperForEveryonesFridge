import fs from 'fs'
import path from 'path'

import ChefDatabaseImpl from '../../database/ChefDatabaseImpl'
import type IChefDatabase from '../../database/IChefDatabase'
import type IConnection from '../../database/IConnection'
import SqliteConnection from '../../database/SqliteConnection'

/**
 * Creates a test database with dummy data.
 */
export default function createTestDatabase (): { database: IChefDatabase, connection: IConnection } {
  const connection = new SqliteConnection(':memory:')
  const database = new ChefDatabaseImpl(connection)
  database.resetDatabase('IKnowWhatIAmDoing')

  const dummyData = fs.readFileSync(path.join(process.cwd(), 'data/dummydata.sql'), 'utf-8')
  connection.exec(dummyData)

  // Add dummy values for meal type embeddings. Testing the embedding logic is not the point of this test
  database.wrapTransaction(writable => {
    for (const mealType of database.getMealTypeNames()) {
      writable.addEmbedding({ sentence: mealType, embedding: Float32Array.from([1, 2, 3]) })
    }
  })
  database.checkIntegrity()

  return { database, connection }
}
