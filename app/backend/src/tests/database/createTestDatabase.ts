import fs from 'fs'
import path from 'path'

import ChefDatabaseImpl from '../../database/ChefDatabaseImpl'
import type IChefDatabase from '../../database/IChefDatabase'
import type IConnection from '../../database/IConnection'
import SqliteConnection from '../../database/SqliteConnection'
import type Tag from '../../types/Tag'

/**
 * Creates a test database with dummy data.
 */
export default function createTestDatabase (): { database: IChefDatabase, connection: IConnection } {
  const connection = new SqliteConnection(':memory:')
  const database = new ChefDatabaseImpl(connection)
  database.resetDatabase('IKnowWhatIAmDoing')

  const testData = fs.readFileSync(path.join(__dirname, 'testdata.sql'), 'utf8')
  connection.exec(testData)

  // Add dummy values for meal type embeddings. Testing the embedding logic is not the point of this test
  database.wrapTransaction(writable => {
    for (const mealType of database.getMealTypeNames()) {
      writable.addEmbedding({ sentence: mealType, embedding: Float32Array.from([1, 2, 3]) })
    }
  })
  database.checkIntegrity()

  return { database, connection }
}

export const testValues = {
  user: {
    id: 1,
    name: 'Testy McTestface',
    bannedIngredients: new Map<number, string>([[1, 'Apples']]),
    bannedTags: new Map<number, Tag>([[1, {
      id: 1,
      name: 'Nuts',
      description: 'Any kind of nut that you may be allergic to'
    }]])
  },
  fridge: {
    id: 1,
    name: 'The Test Fridge'
  }
}
