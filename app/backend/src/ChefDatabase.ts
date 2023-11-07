import sqlite from 'sqlite3'
import path from 'path'

// TODO: Use environment variables and put this somewhere outside the container
const DATABASE_PATH = path.join(process.cwd(), 'working_data/database.sqlite')

/**
 * Writable interface to the database, passed to the callback of {@link ChefDatabase.wrapTransaction}
 */
class WritableDatabase {
  private readonly _db: ChefDatabase

  public constructor (db: ChefDatabase) {
    this._db = db
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

  private readonly _db: sqlite.Database

  private constructor () {
    this._db = new sqlite.Database(DATABASE_PATH)
  }

  /**
   * Wrap `callback` within a transaction. Must be used for any operations that write to the database
   * The transaction will be rolled back if an uncaught exception occurs and the exception re-thrown
   */
  public wrapTransaction (callback: (db: WritableDatabase) => void): void {
    this._db.run('BEGIN TRANSACTION')
    try {
      callback(new WritableDatabase(this))
      this._db.run('COMMIT')
    } catch (ex) {
      this._db.run('ROLLBACK')
      throw ex
    }
  }
}
