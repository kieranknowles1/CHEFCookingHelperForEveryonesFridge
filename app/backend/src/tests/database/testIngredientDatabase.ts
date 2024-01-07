import assert from 'assert'

import { describe, it } from 'mocha'

import type IChefDatabase from '../../database/IChefDatabase'
import type IConnection from '../../database/IConnection'
import type Ingredient from '../../types/Ingredient'

import createTestDatabase from './createTestDatabase'

describe('database/IngredientDatabaseImpl', () => {
  let database: IChefDatabase
  let connection: IConnection

  beforeEach(() => {
    ({ database, connection } = createTestDatabase())
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
      assert.deepStrictEqual(database.ingredients.get(ingredient.id), ingredient)
    })

    it('should throw an error if the ingredient does not exist', () => {
      assert.throws(() => { database.ingredients.get(123456) })
    })
  })

  describe('getAll', () => {
    it('should get all ingredients', () => {
      const ingredients = database.ingredients.getAll()
      const rowCount = connection.prepare<{ count: number }>('SELECT COUNT(*) AS count FROM ingredient').get()?.count

      assert.strictEqual(ingredients.size, rowCount)
    })

    it('should return the same ingredient properties as get', () => {
      const ingredients = database.ingredients.getAll()
      for (const ingredient of ingredients.values()) {
        assert.deepStrictEqual(ingredient, database.ingredients.get(ingredient.id))
      }
    })
  })

  describe('getAllWithAltNames', () => {
    it('should get all ingredients by name, including alternate names', () => {
      const ingredients = database.ingredients.getAllWithAltNames()
      const rowCount = connection.prepare<{ count: number }>('SELECT COUNT(*) AS count FROM view_ingredient_by_name').get()?.count

      assert.strictEqual(ingredients.size, rowCount)
    })

    it('should return the same ingredient properties as get', () => {
      const ingredients = database.ingredients.getAllWithAltNames()
      for (const ingredient of ingredients.values()) {
        assert.deepStrictEqual(ingredient, database.ingredients.get(ingredient.id))
      }
    })
  })

  describe('getByName', () => {
    it('should get an ingredient by its name', () => {
      const byId = database.ingredients.get(1)
      const byName = database.ingredients.getByName(byId.name)

      assert.deepStrictEqual(byName, byId)
    })

    it('should return undefined if the ingredient does not exist', () => {
      assert.deepStrictEqual(database.ingredients.getByName('does not exist'), undefined)
    })
  })
})
