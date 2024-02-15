import assert from 'assert'

import { describe, it } from 'mocha'

import type IChefDatabase from '../../database/IChefDatabase'

import createTestDatabase from './createTestDatabase'

describe('database/FridgeDatabaseImpl', () => {
  let database: IChefDatabase
  beforeEach(() => {
    ({ database } = createTestDatabase())
  })

  describe('get', () => {
    it('should get a fridge', () => {
      const fridge = database.fridges.get(1)
      assert.deepStrictEqual(fridge, {
        id: 1,
        name: 'The Test Fridge'
      })
    })
  })

  describe('getIngredientAmount', () => {
    it('should get the amount of an ingredient', () => {
      const fridgeId = 1
      const ingredientId = 1
      assert.strictEqual(database.fridges.getIngredientAmount(fridgeId, ingredientId), 0)

      database.wrapTransaction(writable => {
        writable.setIngredientAmount(fridgeId, ingredientId, 10)
      })
      assert.strictEqual(database.fridges.getIngredientAmount(fridgeId, ingredientId), 10)
    })
  })
})
