import type Fridge from '../types/Fridge'

import type * as types from './types'
import { type FridgeIngredientAmount, type IFridgeDatabase } from './IChefDatabase'
import type IConnection from './IConnection'
import InvalidIdError from './InvalidIdError'
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
      name: result.name
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
}
