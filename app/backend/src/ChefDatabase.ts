import sqlite from 'sqlite3'
import path from 'path'

import { readFileSync } from 'fs'
import type Recipe from 'Recipe'

// TODO: Use environment variables and put this somewhere outside the container
const DATABASE_PATH = path.join(process.cwd(), 'working_data/database.sqlite')
const SCHEMA_PATH = path.join(process.cwd(), 'data/schema.sql')

/**
 * Writable interface to the database, passed to the callback of {@link ChefDatabase.wrapTransaction}
 * and is only valid for the duration of the callback.
 */
class WritableDatabase {
  private readonly _db: ChefDatabase
  private readonly _connection: sqlite.Database

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

  public constructor (db: ChefDatabase, connection: sqlite.Database) {
    this._db = db
    this._connection = connection
  }

  public addRecipe (recipe: Recipe): void {
    this.assertValid()
    this._connection.run(`
      INSERT INTO recipe
        (name, directions, link)
      VALUES
        (?, ?, ?)
    `, recipe.name, recipe.directions, recipe.link)
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

  private readonly _connection: sqlite.Database

  private constructor () {
    this._connection = new sqlite.Database(DATABASE_PATH)
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
      this._connection.run('BEGIN TRANSACTION')
      callback(writable)
      this._connection.run('COMMIT')
    } catch (ex) {
      this._connection.run('ROLLBACK')
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
      this._connection.run('BEGIN TRANSACTION')
      callback(writable).then(() => {
        this._connection.run('COMMIT')
        resolve()
      }).catch((ex) => {
        this._connection.run('ROLLBACK')
        reject(ex)
      }).finally(() => {
        writable.close()
      })
    })
  }
}
