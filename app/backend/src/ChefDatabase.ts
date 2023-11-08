import sqlite from 'sqlite3'
import path from 'path'

import { readFileSync } from 'fs'

// TODO: Use environment variables and put this somewhere outside the container
const DATABASE_PATH = path.join(process.cwd(), 'working_data/database.sqlite')
const SCHEMA_PATH = path.join(process.cwd(), 'data/schema.sql')

/**
 * Writable interface to the database, passed to the callback of {@link ChefDatabase.wrapTransaction}
 */
class WritableDatabase {
  private readonly _db: ChefDatabase
  private readonly _connection: sqlite.Database

  public constructor (db: ChefDatabase, connection: sqlite.Database) {
    this._db = db
    this._connection = connection
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
   * Wrap `callback` within a transaction. Must be used for any operations that write to the database
   * The transaction will be rolled back if an uncaught exception occurs and the exception re-thrown
   */
  public wrapTransaction (callback: (db: WritableDatabase) => void): void {
    this._connection.run('BEGIN TRANSACTION')
    try {
      callback(new WritableDatabase(this, this._connection))
      this._connection.run('COMMIT')
    } catch (ex) {
      this._connection.run('ROLLBACK')
      throw ex
    }
  }
}
