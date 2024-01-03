export interface FunctionOptions {
  deterministic: boolean
  varargs: boolean
}

export interface RunResult {
  /**
   * The number of rows that were changed by the statement (INSERT, UPDATE or DELETE)
   */
  changes: number
  /**
   * The rowid of the last row inserted into the database
   */
  lastInsertRowid: number | bigint
}

export type SqliteValue = number | string | bigint | Buffer | null
/**
 * Bind parameters in the format { name: value }
 * Note that the @, $, or : should be omitted.
 */
export type BindParams = Record<string, SqliteValue>

/**
 * A prepared statement that can be executed multiple times with different parameters
 * NOTE: It is the responsibility of the caller to ensure that type parameters match the SQL statement
 */
export interface IPreparedStatement<TRow> {
  /**
   * Execute the statement with the given parameters
   * Returns the number of rows that were changed by the statement (INSERT, UPDATE or DELETE)
   * and the rowid of the last row inserted into the database
   */
  run: (params?: BindParams) => RunResult

  /**
   * Execute the statement with the given parameters
   * Returns the first row of the result set, or undefined if there are no rows
   */
  get: (params?: BindParams) => TRow | undefined

  /**
   * Execute the statement with the given parameters
   * Returns all rows of the result set, or an empty array if there are no rows
   */
  all: (params?: BindParams) => TRow[]
}

export default interface IConnection {
  /**
   * Check the integrity of the database and all of its tables
   * @throws {Error} If the integrity check fails
   */
  checkIntegrity: () => void

  /**
  * Execute a statement that takes no parameters and returns no rows
  */
  exec: (sql: string) => void

  /**
   * Prepare a statement that can be executed multiple times with different parameters
   * NOTE: For consistency, bind parameters should be named with a leading colon (:)
   */
  prepare: <TRow>(sql: string) => IPreparedStatement<TRow>

  /**
   * Register a function that can be called from SQL statements
   */
  function: (name: string, options: FunctionOptions, callback: (...args: unknown[]) => unknown) => void
}
