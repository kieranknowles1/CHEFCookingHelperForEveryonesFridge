import assert from 'assert'

import { describe, it } from 'mocha'

import { type IngredientAmount, type IngredientId, type IngredientNoId } from '../../types/Ingredient'
import type IChefDatabase from '../../database/IChefDatabase'
import type IConnection from '../../database/IConnection'
import { type RecipeNoId } from '../../types/Recipe'

import createTestDatabase from './createTestDatabase'

const embedded = { sentence: 'test', embedding: Float32Array.from([1, 2, 3]) }

describe('database/WritableDatabaseImpl', () => {
  let database: IChefDatabase
  let connection: IConnection
  beforeEach(() => {
    ({ database, connection } = createTestDatabase())
  })

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
      assert.deepStrictEqual(database.ingredients.get(id), { id, ...ingredient })
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
