import assert from 'assert'

import { describe, it } from 'mocha'

import type IChefDatabase from '../../database/IChefDatabase'
import type IConnection from '../../database/IConnection'
import { type RecipeNoId } from '../../types/Recipe'

import createTestDatabase from './createTestDatabase'

describe('database/FridgeDatabaseImpl', () => {
  let database: IChefDatabase
  let connection: IConnection
  beforeEach(() => {
    ({ database, connection } = createTestDatabase())
  })

  describe('get', () => {
    it('should get a fridge', () => {
      const fridge = database.fridges.get(1)
      assert.deepStrictEqual(fridge, {
        id: 1,
        name: 'The Test Fridge',
        ownerId: 1
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

  describe('getAvailableRecipes', () => {
    const recipe: RecipeNoId = {
      name: { sentence: 'Test Recipe', embedding: Float32Array.from([1, 2, 3]) },
      directions: 'Do something with whatever is in the fridge',
      ingredients: new Map([[1, { amount: 1, originalLine: '1' }], [2, { amount: 2, originalLine: '2' }]]),
      link: 'https://example.com',
      mealType: { sentence: 'Breakfast', embedding: Float32Array.from([1, 2, 3]) }
    }
    let recipeId: number
    beforeEach(() => {
      recipeId = database.wrapTransaction(writable => {
        return writable.addRecipe(recipe)
      })
    })

    it('should get available recipes', () => {
      // Give the test fridge the ingredients needed for the recipe
      database.wrapTransaction(writable => {
        writable.setIngredientAmount(1, 1, 1)
        writable.setIngredientAmount(1, 2, 2)
      })

      const available = database.fridges.getAvailableRecipes(1, /* checkAmounts */ true, 0, null)
      assert.deepStrictEqual(available, [
        { id: recipeId, name: recipe.name, missingIngredientAmount: 0 }
      ])
    })

    it('should check the available amounts of ingredients', () => {
      database.wrapTransaction(writable => {
        writable.setIngredientAmount(1, 1, 1)
        // Not enough of ingredient 2, needed 2 but only have 1
        writable.setIngredientAmount(1, 2, 1)
      })

      const available = database.fridges.getAvailableRecipes(1, /* checkAmounts */ true, 0, null)
      assert.deepStrictEqual(available, [])

      const availableAllowMissing = database.fridges.getAvailableRecipes(1, /* checkAmounts */ true, 1, null)
      assert.deepStrictEqual(availableAllowMissing, [
        { id: recipeId, name: recipe.name, missingIngredientAmount: 1 }
      ])
    })
  })
})
