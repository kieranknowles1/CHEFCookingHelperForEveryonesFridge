import { type AvailableRecipe } from '../types/Recipe'
import type Fridge from '../types/Fridge'

import type * as types from './types'
import { type FridgeIngredientAmount, type IFridgeDatabase } from './IChefDatabase'
import type IConnection from './IConnection'
import InvalidIdError from './InvalidIdError'
import { bufferToFloat32Array } from './bufferFloat32Array'
import ingredientFromRow from './ingredientFromRow'

export default class FridgeDatabaseImpl implements IFridgeDatabase {
  private readonly _connection: IConnection

  public constructor (connection: IConnection) {
    this._connection = connection
  }

  public get (id: types.RowId): Fridge {
    const statement = this._connection.prepare<types.FridgeRow>(`
      SELECT * FROM fridge WHERE id = :id
    `)
    const result = statement.get({ id })

    if (result === undefined) {
      throw new InvalidIdError('fridge', id)
    }

    return {
      id: result.id,
      name: result.name,
      ownerId: result.owner_id
    }
  }

  public getIngredientAmount (fridgeId: types.RowId, ingredientId: types.RowId): number {
    const statement = this._connection.prepare<{ amount: number }>(`
      SELECT amount
      FROM fridge_ingredient
      WHERE fridge_id = :fridgeId AND ingredient_id = :ingredientId
    `)
    const result = statement.get({ fridgeId, ingredientId })

    return result?.amount ?? 0
  }

  public getAllIngredientAmounts (fridgeId: types.RowId): Map<types.RowId, FridgeIngredientAmount> {
    type IAllIngredientAmountsRow = types.IngredientRow & types.FridgeIngredientRow
    const statement = this._connection.prepare<IAllIngredientAmountsRow>(`
      SELECT *
      FROM fridge_ingredient
      JOIN ingredient ON ingredient.id = fridge_ingredient.ingredient_id
      WHERE fridge_id = :fridgeId
      ORDER BY ingredient.name
    `)
    const result = statement.all({ fridgeId })

    const map = new Map<types.RowId, FridgeIngredientAmount>()
    for (const row of result) {
      map.set(row.ingredient_id, {
        amount: row.amount,
        ingredient: ingredientFromRow(row)
      })
    }
    return map
  }

  public getAvailableRecipes (fridgeId: types.RowId, checkAmount: boolean, maxMissingIngredients: number, mealType: string | null): AvailableRecipe[] {
    interface AvailableRecipesResultRow {
      id: types.RowId
      name: string
      embedding: Buffer
      missing_count: number
    }

    // Well this was easier than expected
    // TODO: Optionally allow substitutions
    const statement = this._connection.prepare<AvailableRecipesResultRow>(`
      SELECT
        recipe.name, recipe.id,
        embedding.embedding,
        COUNT(
          CASE WHEN
            -- Check if fridge has ingredient
            (fridge_ingredient.amount IS NULL)
            -- Optionally check if fridge has enough ingredient
            OR (:checkAmount AND fridge_ingredient.amount < recipe_ingredient.amount)
          THEN 1 END
        ) as missing_count
      FROM
        recipe
      JOIN embedding ON embedding.sentence = recipe.name
      LEFT JOIN recipe_ingredient ON recipe_ingredient.recipe_id = recipe.id
      LEFT JOIN fridge_ingredient ON fridge_ingredient.ingredient_id = recipe_ingredient.ingredient_id AND fridge_ingredient.fridge_id = :fridgeId
      JOIN ingredient ON ingredient.id = recipe_ingredient.ingredient_id AND NOT ingredient.assumeUnlimited
      WHERE recipe.meal_type_id = (SELECT id FROM meal_type WHERE name = :mealType) OR :mealType IS NULL
      GROUP BY recipe.id
      -- COUNT excludes NULLs. Less than used to optionally allow missing ingredients
      HAVING missing_count <= :maxMissingIngredients
    `)
    const result = statement.all({ fridgeId, mealType, maxMissingIngredients, checkAmount: checkAmount ? 1 : 0 })

    return result
      .map(row => ({
        id: row.id,
        name: { sentence: row.name, embedding: bufferToFloat32Array(row.embedding) },
        missingIngredientAmount: row.missing_count
      }))
  }
}
