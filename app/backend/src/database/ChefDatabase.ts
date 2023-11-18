import { readFileSync } from 'fs'
import CiMap from '@glossa-glo/case-insensitive-map'
import Database from 'better-sqlite3'
import path from 'path'

import { ingredientMapFactory, type IngredientId } from '../IIngredient'
import type { IRecipeNoId } from '../IRecipe'
import type * as types from './types'
import type IIngredient from '../IIngredient'
import type IRecipe from '../IRecipe'

// TODO: Use environment variables and put this somewhere outside the container
const DATABASE_PATH = path.join(process.cwd(), 'working_data/database.sqlite')
const SCHEMA_PATH = path.join(process.cwd(), 'data/schema.sql')
const INITIAL_DATA_PATH = path.join(process.cwd(), 'data/initialdata.sql')

export class InvalidIdError extends Error {
  constructor (table: string, id: types.RowId) {
    super(`Invalid ID ${id} for table ${table}`)
  }
}

/**
 * Writable interface to the database, passed to the callback of {@link ChefDatabase.wrapTransaction}
 * and is only valid for the duration of the callback.
 */
class WritableDatabase {
  private readonly _db: ChefDatabase
  private readonly _connection: Database.Database

  /** Whether the WritableDatabase is usable. Only true for the duration of {@link ChefDatabase.wrapTransaction} */
  private _valid: boolean = true
  public close (): void {
    this._valid = false
  }

  private assertValid (): void {
    if (!this._valid) {
      throw new Error('WritableDatabase has been closed')
    }
  }

  public constructor (db: ChefDatabase, connection: Database.Database) {
    this._db = db
    this._connection = connection
  }

  public addIngredient (ingredient: IIngredient): void {
    this.assertValid()
    this._connection.prepare<string>(`
      INSERT INTO ingredient
        (name)
      VALUES
        (?)
    `)
      .run(ingredient.name)
  }

  public addRecipe (recipe: IRecipeNoId): void {
    this.assertValid()
    const statement = this._connection.prepare<[string, string, string]>(`
      INSERT INTO recipe
        (name, directions, link)
      VALUES
        (?, ?, ?)
    `)
    const id = statement.run(recipe.name, recipe.directions, recipe.link).lastInsertRowid

    const ingredientStatement = this._connection.prepare<[types.RowId, types.RowId, number | null, string]>(`
      INSERT INTO recipe_ingredient
        (recipe_id, ingredient_id, amount, original_line)
      VALUES
        (?, ?, ?, ?)
    `)
    for (const [ingredientId, amount] of recipe.ingredients) {
      ingredientStatement.run(id, ingredientId, amount.amount, amount.originalLine)
    }
  }
}

export default class ChefDatabase {
  private static _instance: ChefDatabase | null = null
  public static get Instance (): ChefDatabase {
    if (this._instance == null) {
      this._instance = new ChefDatabase()
    }
    return this._instance
  }

  private readonly _connection: Database.Database

  private constructor () {
    this._connection = new Database(DATABASE_PATH)
  }

  /**
   * Run the schema and initial script. Should only be used during setup
   *
   * WARN: This will delete ALL data from the database.
   */
  public resetDatabase (_: 'IKnowWhatIAmDoing'): void {
    const schema = readFileSync(SCHEMA_PATH, 'utf-8')
    this._connection.exec(schema)
    const initialData = readFileSync(INITIAL_DATA_PATH, 'utf-8')
    this._connection.exec(initialData)
  }

  /**
   * Wrap `callback` within a transaction. Must be used for any operations that write to the database
   * The transaction will be rolled back if an uncaught exception occurs and the exception re-thrown
   */
  public wrapTransaction<TReturn = void> (callback: (db: WritableDatabase) => TReturn): TReturn {
    const writable = new WritableDatabase(this, this._connection)
    try {
      this._connection.exec('BEGIN TRANSACTION')
      const data = callback(writable)
      this._connection.exec('COMMIT')
      return data
    } catch (ex) {
      this._connection.exec('ROLLBACK')
      throw ex
    } finally {
      writable.close()
    }
  }

  /**
   * Async version of {@link wrapTransaction} that waits for the promise to be
   * settled before committing/rolling back
   * @returns The return value of `callback` or void if none
   */
  public async wrapTransactionAsync<TReturn = void> (callback: (db: WritableDatabase) => Promise<TReturn>): Promise<TReturn> {
    return new Promise<TReturn>((resolve, reject) => {
      const writable = new WritableDatabase(this, this._connection)
      this._connection.exec('BEGIN TRANSACTION')
      callback(writable).then(data => {
        this._connection.exec('COMMIT')
        resolve(data)
      }).catch((ex) => {
        this._connection.exec('ROLLBACK')
        reject(ex)
      }).finally(() => {
        writable.close()
      })
    })
  }

  private ingredientFromRow (row: types.IIngredientRow): IIngredient {
    return {
      id: row.id,
      name: row.name,
      preferredUnit: row.preferredUnit,
      density: row.density,
      assumeUnlimited: row.assumeUnlimited !== 0
    }
  }

  public getIngredient (id: IngredientId): IIngredient {
    const statement = this._connection.prepare<[types.RowId]>(`
      SELECT * FROM ingredient WHERE id = ?
    `)
    const result = statement.get(id) as types.GetResult<types.IIngredientRow>

    if (result === undefined) {
      throw new InvalidIdError('ingredient', id)
    }

    return this.ingredientFromRow(result)
  }

  /**
   * @param name The name to search for
   * @returns The ingredient, or null if it is not found. May return
   * an equipotent ingredient if an exact match is not found.
   */
  public findIngredientByName (name: string): IIngredient | null {
    const statement = this._connection.prepare<string>(`
      SELECT ingredient.*
        FROM view_ingredient_by_name
        JOIN ingredient ON view_ingredient_by_name.id = ingredient.id
        WHERE view_ingredient_by_name.name = ? COLLATE NOCASE
    `)
    const result = statement.get(name) as types.GetResult<types.IIngredientRow>
    if (result === undefined) {
      return null
    }

    return this.ingredientFromRow(result)
  }

  /**
   * Get a map of ingredient names to IDs, including any alternate names
   */
  public getIngredientIds (): CiMap<string, IngredientId> {
    const statement = this._connection.prepare(`
      SELECT * FROM view_ingredient_by_name
    `)
    const result = statement.all() as types.AllResult<types.IIngredientRow>
    const map = new CiMap<string, IngredientId>()
    for (const pair of result) {
      map.set(pair.name, pair.id)
    }

    return map
  }

  /**
   * Get a recipe by its ID
   */
  public getRecipe (id: types.RowId): IRecipe {
    type Result = types.IRecipeRow & types.IRecipeIngredientRow
    const statement = this._connection.prepare<[types.RowId]>(`
      SELECT *
        FROM recipe
        JOIN recipe_ingredient ON recipe_ingredient.recipe_id = recipe.id
        WHERE recipe.id = ?
    `)

    const result = statement.all(id) as types.AllResult<Result>
    if (result.length === 0) { throw new InvalidIdError('recipe', id) }

    const ingredients = ingredientMapFactory()
    for (const row of result) {
      ingredients.set(row.ingredient_id, {
        amount: row.amount,
        originalLine: row.original_line
      })
    }

    return {
      id: result[0].id,
      name: result[0].name,
      directions: result[0].directions,
      ingredients,
      link: result[0].link
    }
  }
}
