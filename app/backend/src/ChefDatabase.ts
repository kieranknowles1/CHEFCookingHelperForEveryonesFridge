import { readFileSync } from 'fs'
import CiMap from '@glossa-glo/case-insensitive-map'
import Database from 'better-sqlite3'
import path from 'path'

import { type DatabaseUnit } from 'Unit'
import Ingredient from './Ingredient'
import type { IIngredient, IngredientId } from './Ingredient'
import type { IRecipe } from './Recipe'

// TODO: Use environment variables and put this somewhere outside the container
const DATABASE_PATH = path.join(process.cwd(), 'working_data/database.sqlite')
const SCHEMA_PATH = path.join(process.cwd(), 'data/schema.sql')

type GetResult<TRow> = TRow | undefined
type AllResult<TRow> = TRow[]

interface IIngredientRow {
  id: number
  name: string
  preferredUnit: DatabaseUnit
  density: number | null
  assumeUnlimited: number
}

interface IRecipeRow {
  id: number
  name: string
  directions: string
  link: string
}

interface IRecipeIngredientRow {
  recipe_id: number
  ingredient_id: number

  amount: number | null
  original_line: string
}

export class InvalidIdError extends Error {
  constructor (table: string, id: number) {
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

  public addRecipe (recipe: IRecipe): void {
    this.assertValid()
    const statement = this._connection.prepare<[string, string, string]>(`
      INSERT INTO recipe
        (name, directions, link)
      VALUES
        (?, ?, ?)
    `)
    const id = statement.run(recipe.name, recipe.directions, recipe.link).lastInsertRowid

    const ingredientStatement = this._connection.prepare<[number | bigint, number, number | null, string]>(`
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
   * Run the schema script. Should only be used during setup
   *
   * WARN: This will delete ALL data from the database.
   */
  public setupSchema (): void {
    const schema = readFileSync(SCHEMA_PATH, 'utf-8')
    this._connection.exec(schema)
  }

  /**
   * Wrap `callback` within a transaction. Must be used for any operations that write to the database
   * The transaction will be rolled back if an uncaught exception occurs and the exception re-thrown
   */
  public wrapTransaction (callback: (db: WritableDatabase) => void): void {
    const writable = new WritableDatabase(this, this._connection)
    try {
      this._connection.exec('BEGIN TRANSACTION')
      callback(writable)
      this._connection.exec('COMMIT')
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
   */
  public async wrapTransactionAsync (callback: (db: WritableDatabase) => Promise<void>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const writable = new WritableDatabase(this, this._connection)
      this._connection.exec('BEGIN TRANSACTION')
      callback(writable).then(() => {
        this._connection.exec('COMMIT')
        resolve()
      }).catch((ex) => {
        this._connection.exec('ROLLBACK')
        reject(ex)
      }).finally(() => {
        writable.close()
      })
    })
  }

  private ingredientFromRow (row: IIngredientRow): Ingredient {
    return new Ingredient({
      name: row.name,
      preferredUnit: row.preferredUnit,
      density: row.density,
      assumeUnlimited: row.assumeUnlimited !== 0
    }, row.id)
  }

  public getIngredient (id: IngredientId): Ingredient {
    const statement = this._connection.prepare<number>(`
      SELECT * FROM ingredient WHERE id = ?
    `)
    const result = statement.get(id) as GetResult<IIngredientRow>

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
  public findIngredientByName (name: string): Ingredient | null {
    const statement = this._connection.prepare<string>(`
      SELECT ingredient.*
        FROM view_ingredient_by_name
        JOIN ingredient ON view_ingredient_by_name.id = ingredient.id
        WHERE view_ingredient_by_name.name = ? COLLATE NOCASE
    `)
    const result = statement.get(name) as GetResult<IIngredientRow>
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
    const result = statement.all() as AllResult<IIngredientRow>
    const map = new CiMap<string, IngredientId>()
    for (const pair of result) {
      map.set(pair.name, pair.id)
    }

    return map
  }
}
