import assert from 'assert'
import fs from 'fs'
import path from 'path'

import { describe, it } from 'mocha'

import { type IngredientAmount, type IngredientId, type IngredientNoId } from '../../types/Ingredient'
import ChefDatabaseImpl from '../../database/ChefDatabaseImpl'
import type IChefDatabase from '../../database/IChefDatabase'
import type IConnection from '../../database/IConnection'
import { type IWritableDatabase } from '../../database/IChefDatabase'
import type Ingredient from '../../types/Ingredient'
import { type RecipeNoId } from '../../types/Recipe'
import SqliteConnection from '../../database/SqliteConnection'

const embedded = { sentence: 'test', embedding: Float32Array.from([1, 2, 3]) }

describe('database/ChefDatabaseImpl', () => {
  let connection: IConnection
  let database: IChefDatabase
  beforeEach(() => {
    connection = new SqliteConnection(':memory:')
    database = new ChefDatabaseImpl(connection)
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
  })

  describe('checkIntegrity', () => {
    it('should succeed for a valid database', () => {
      // meal_type relies on setup to be valid, drop it for this test
      connection.exec('DROP TABLE meal_type')
      database.checkIntegrity()
      assert.ok(true)
    })

    it('should fail for a database with foreign key errors', () => {
      connection.exec('PRAGMA foreign_keys = OFF')
      connection.exec('INSERT INTO fridge_ingredient (fridge_id, ingredient_id, amount) VALUES (123, 123, 123)')
      connection.exec('PRAGMA foreign_keys = ON')

      assert.throws(() => { database.checkIntegrity() })
    })
  })

  describe('wrapTransaction', () => {
    it('should wrap a transaction', () => {
      database.wrapTransaction(writable => {
        writable.addEmbedding(embedded)
      })
      assert.deepStrictEqual(database.getEmbedding(embedded.sentence), embedded)
    })

    it('should rollback and rethrow on error', () => {
      assert.throws(() => {
        database.wrapTransaction(writable => {
          writable.addEmbedding(embedded)
          throw new Error('test')
        })
      }, /test/)
      assert.deepStrictEqual(database.getEmbedding('test'), null)
    })

    it('should invalidate the writable after commit', () => {
      let writable: IWritableDatabase
      database.wrapTransaction(w => {
        writable = w
      })
      assert.throws(() => { writable.addEmbedding(embedded) })
    })
  })

  describe('wrapTransactionAsync', () => {
    it('should wrap a transaction', async () => {
      await database.wrapTransactionAsync(async writable => {
        writable.addEmbedding(embedded)
        await new Promise(resolve => setTimeout(resolve, 20))
      })
      assert.deepStrictEqual(database.getEmbedding(embedded.sentence), embedded)
    })

    it('should rollback and rethrow on error', async () => {
      await assert.rejects(async () => {
        await database.wrapTransactionAsync(async writable => {
          writable.addEmbedding(embedded)
          await new Promise(resolve => setTimeout(resolve, 20))
          throw new Error('test')
        })
      }, /test/)
      assert.deepStrictEqual(database.getEmbedding('test'), null)
    })

    it('should invalidate the writable after commit', async () => {
      let writable: IWritableDatabase
      await database.wrapTransactionAsync(async w => {
        writable = w
        await new Promise(resolve => setTimeout(resolve, 20))
      })
      assert.throws(() => { writable.addEmbedding(embedded) })
    })
  })

  describe('getIngredient', () => {
    it('should get an ingredient', () => {
      const ingredient: Ingredient = {
        id: 1234,
        name: 'test',
        assumeUnlimited: false,
        density: 1,
        preferredUnit: 'g'
      }
      connection.exec("INSERT INTO ingredient (id, name, assumeUnlimited, density, preferredUnit) VALUES (1234, 'test', 0, 1, 'g')")
      assert.deepStrictEqual(database.getIngredient(ingredient.id), ingredient)
    })

    it('should throw an error if the ingredient does not exist', () => {
      assert.throws(() => { database.getIngredient(123456) })
    })
  })

  describe('getAllIngredients', () => {
    it('should get all ingredients', () => {
      const ingredients = database.getAllIngredients()
      const rowCount = connection.prepare<[], { count: number }>('SELECT COUNT(*) AS count FROM ingredient').get()?.count

      assert.strictEqual(ingredients.size, rowCount)
    })

    it('should return the same ingredient properties as getIngredient', () => {
      const ingredients = database.getAllIngredients()
      for (const ingredient of ingredients.values()) {
        assert.deepStrictEqual(ingredient, database.getIngredient(ingredient.id))
      }
    })
  })

  describe('getAllIngredientsByName', () => {
    it('should get all ingredients by name', () => {
      const ingredients = database.getAllIngredientsByName()
      const rowCount = connection.prepare<[], { count: number }>('SELECT COUNT(*) AS count FROM view_ingredient_by_name').get()?.count

      assert.strictEqual(ingredients.size, rowCount)
    })

    it('should return the same ingredient properties as getIngredient', () => {
      const ingredients = database.getAllIngredientsByName()
      for (const ingredient of ingredients.values()) {
        assert.deepStrictEqual(ingredient, database.getIngredient(ingredient.id))
      }
    })
  })

  describe('findIngredientByName', () => {
    it('should get an ingredient by its name', () => {
      const byId = database.getIngredient(1)
      const byName = database.findIngredientByName(byId.name)

      assert.deepStrictEqual(byName, byId)
    })

    it('should return null if the ingredient does not exist', () => {
      assert.deepStrictEqual(database.findIngredientByName('does not exist'), null)
    })
  })

  describe('WritableDatabase', () => {
    describe('addEmbedding', () => {
      it('should add an embedding', () => {
        database.wrapTransaction(writable => {
          writable.addEmbedding(embedded)
        })
        assert.deepStrictEqual(database.getEmbedding(embedded.sentence), embedded)
      })
    })

    describe('addIngredient', () => {
      it('should add an ingredient', () => {
        const ingredient: IngredientNoId = {
          name: 'test',
          assumeUnlimited: false,
          density: 1,
          preferredUnit: 'g'
        }
        const id = database.wrapTransaction(writable => {
          return writable.addIngredient(ingredient)
        })
        assert.deepStrictEqual(database.getIngredient(id), { id, ...ingredient })
      })
    })

    describe('addRecipe', () => {
      it('should add a recipe', () => {
        const recipe: RecipeNoId = {
          directions: 'do the thing with the stuff',
          ingredients: new Map<IngredientId, IngredientAmount>([
            [1, { amount: 1, originalLine: '1 whatever of stuff' }]
          ]),
          link: 'https://example.com',
          mealType: { sentence: 'Breakfast', embedding: Float32Array.from([1, 2, 3]) },
          name: { sentence: 'Food', embedding: Float32Array.from([3, 2, 1]) }
        }
        const id = database.wrapTransaction(writable => {
          return writable.addRecipe(recipe)
        })
        assert.deepStrictEqual(database.getRecipe(id), { id, ...recipe })
      })
    })

    describe('setIngredientAmount', () => {
      it('should set an ingredient amount', () => {
        database.wrapTransaction(writable => {
          writable.setIngredientAmount(1, 1, 1234)
        })
        assert.deepStrictEqual(database.getIngredientAmount(1, 1), 1234)
      })

      it('should remove an ingredient amount if set to 0', () => {
        database.wrapTransaction(writable => {
          writable.setIngredientAmount(1, 1, 1234)
          writable.setIngredientAmount(1, 1, 0)
        })
        const statement = connection.prepare('SELECT * FROM fridge_ingredient WHERE fridge_id = 1 AND ingredient_id = 1')
        // This is abstracted away in the database, but we want to test it here
        assert.strictEqual(statement.all().length, 0)
      })
    })
  })
})
