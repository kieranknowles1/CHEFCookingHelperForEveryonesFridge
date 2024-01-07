import CaseInsensitiveMap from '../types/CaseInsensitiveMap'
import type Ingredient from '../types/Ingredient'
import { type IngredientId } from '../types/Ingredient'

import type * as types from './types'
import type IConnection from './IConnection'
import { type IIngredientDatabase } from './IChefDatabase'
import InvalidIdError from './InvalidIdError'
import ingredientFromRow from './ingredientFromRow'

export default class IngredientDatabaseImpl implements IIngredientDatabase {
  private readonly _connection: IConnection

  public constructor (connection: IConnection) {
    this._connection = connection
  }

  public get (id: IngredientId): Ingredient {
    const statement = this._connection.prepare<types.IngredientRow>(`
      SELECT * FROM ingredient WHERE id = :id
    `)
    const result = statement.get({ id })

    if (result === undefined) {
      throw new InvalidIdError('ingredient', id)
    }

    return ingredientFromRow(result)
  }

  public getByName (name: string): Ingredient | undefined {
    const statement = this._connection.prepare<types.IngredientRow>(`
      SELECT ingredient.*
        FROM view_ingredient_by_name
        JOIN ingredient ON view_ingredient_by_name.id = ingredient.id
        WHERE view_ingredient_by_name.name = :name COLLATE NOCASE
    `)
    const result = statement.get({ name })
    if (result === undefined) {
      return undefined
    }

    return ingredientFromRow(result)
  }

  public getAll (): Map<types.RowId, Ingredient> {
    const statement = this._connection.prepare<types.IngredientRow>(`
      SELECT * FROM ingredient
    `)
    const result = statement.all()

    return new Map(result.map(row => [
      row.id,
      ingredientFromRow(row)
    ]))
  }

  public getAllWithAltNames (): CaseInsensitiveMap<Ingredient> {
    type Result = types.IngredientRow & { alt_name: string }
    const statement = this._connection.prepare<Result>(`
      SELECT
        view_ingredient_by_name.name AS alt_name,
        ingredient.*
      FROM view_ingredient_by_name
        JOIN ingredient ON ingredient.id = view_ingredient_by_name.id
    `)
    const result = statement.all()
    const map = new CaseInsensitiveMap<Ingredient>()
    for (const pair of result) {
      map.set(pair.alt_name, ingredientFromRow(pair))
    }

    return map
  }
}
