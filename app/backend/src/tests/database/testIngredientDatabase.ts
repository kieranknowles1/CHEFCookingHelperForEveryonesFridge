import assert from 'assert'

import { describe, it } from 'mocha'

import ChefDatabaseImpl from '../../database/ChefDatabaseImpl'
import type IConnection from '../../database/IConnection'
import { type IIngredientDatabase } from '../../database/IChefDatabase'
import type Ingredient from '../../types/Ingredient'
import IngredientDatabaseImpl from '../../database/IngredientDatabaseImpl'
import SqliteConnection from '../../database/SqliteConnection'

describe('database/IngredientDatabaseImpl', () => {
  let database: IIngredientDatabase
  let connection: IConnection

  beforeEach(() => {
    connection = new SqliteConnection(':memory:')
    const chefDb = new ChefDatabaseImpl(connection)
    chefDb.resetDatabase('IKnowWhatIAmDoing')
    database = chefDb.ingredients
    // We want to specifically test the IngredientDatabaseImpl, not any other implementation
    assert(database instanceof IngredientDatabaseImpl)
  })

  describe('get', () => {
    it('should get an ingredient', () => {
      const ingredient: Ingredient = {
        id: 1234,
        name: 'test',
        assumeUnlimited: false,
        density: 1,
        preferredUnit: 'g'
      }
      connection.exec("INSERT INTO ingredient (id, name, assumeUnlimited, density, preferredUnit) VALUES (1234, 'test', 0, 1, 'g')")
      assert.deepStrictEqual(database.get(ingredient.id), ingredient)
    })

    it('should throw an error if the ingredient does not exist', () => {
      assert.throws(() => { database.get(123456) })
    })
  })

  describe('getAll', () => {
    it('should get all ingredients', () => {
      const ingredients = database.getAll()
      const rowCount = connection.prepare<{ count: number }>('SELECT COUNT(*) AS count FROM ingredient').get()?.count

      assert.strictEqual(ingredients.size, rowCount)
    })

    it('should return the same ingredient properties as get', () => {
      const ingredients = database.getAll()
      for (const ingredient of ingredients.values()) {
        assert.deepStrictEqual(ingredient, database.get(ingredient.id))
      }
    })
  })

  describe('getAllWithAltNames', () => {
    it('should get all ingredients by name, including alternate names', () => {
      const ingredients = database.getAllWithAltNames()
      const rowCount = connection.prepare<{ count: number }>('SELECT COUNT(*) AS count FROM view_ingredient_by_name').get()?.count

      assert.strictEqual(ingredients.size, rowCount)
    })

    it('should return the same ingredient properties as get', () => {
      const ingredients = database.getAllWithAltNames()
      for (const ingredient of ingredients.values()) {
        assert.deepStrictEqual(ingredient, database.get(ingredient.id))
      }
    })
  })

  describe('getByName', () => {
    it('should get an ingredient by its name', () => {
      const byId = database.get(1)
      const byName = database.getByName(byId.name)

      assert.deepStrictEqual(byName, byId)
    })

    it('should return undefined if the ingredient does not exist', () => {
      assert.deepStrictEqual(database.getByName('does not exist'), undefined)
    })
  })
})
