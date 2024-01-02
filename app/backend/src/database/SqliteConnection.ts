// Allow type assertions here because the user of this class is expected to provide the correct types
// for the statement results

// TODO: See if io-ts can be used to validate the results of the statements
// Not sure how to handle buffer results though

import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'
import sqlite from 'better-sqlite3'

import logger from '../logger'

import { type FunctionOptions, type IPreparedStatement, type SqliteValue } from './IConnection'
import type IConnection from './IConnection'
import decodeObject from '../decodeObject'

const IntegrityCheckRow = t.type({
  integrity_check: t.string
})
type IntegrityCheckRowT = t.TypeOf<typeof IntegrityCheckRow>

const ForeignKeyCheckRow = t.type({
  table: t.string,
  rowid: t.number,
  parent: t.string,
  fkid: t.number
})
type ForeignKeyCheckRowT = t.TypeOf<typeof ForeignKeyCheckRow>

export abstract class IntegrityCheckError extends Error {}

export class CorruptDatabaseError extends IntegrityCheckError {
  constructor (result: IntegrityCheckRowT[]) {
    super(`Database is corrupt: ${JSON.stringify(result)}`)
    this.name = 'CorruptDatabaseError'
  }
}

export class ForeignKeyCheckError extends IntegrityCheckError {
  constructor (result: ForeignKeyCheckRowT[]) {
    super(`Foreign key check failed: ${JSON.stringify(result)}`)
    this.name = 'ForeignKeyCheckError'
  }
}

/**
 * A connection backed by a SQLite database
 */
export default class SqliteConnection implements IConnection {
  private readonly db: sqlite.Database

  /**
   * Create a new connection. Can be backed by an in-memory database by passing ':memory:' as the filename
   */
  constructor (filename: string) {
    logger.info(`Connecting to database at ${filename}`)
    this.db = sqlite(filename)
  }

  public checkIntegrity (): void {
    // Expecting this to return exactly one row with the value 'ok'
    const integrityCheck = decodeObject(t.array(IntegrityCheckRow), this.db.pragma('integrity_check'))
    if (integrityCheck.length !== 1 || integrityCheck[0].integrity_check !== 'ok') {
      throw new CorruptDatabaseError(integrityCheck)
    }

    // Expecting this to not return anything
    const foreignKeyCheck = decodeObject(t.array(ForeignKeyCheckRow), this.db.pragma('foreign_key_check'))
    if (foreignKeyCheck.length > 0) {
      throw new ForeignKeyCheckError(foreignKeyCheck)
    }
  }

  public exec (sql: string): void {
    this.db.exec(sql)
  }

  public function (name: string, options: FunctionOptions, callback: (...args: unknown[]) => unknown): void {
    this.db.function(name, options, callback)
  }

  public prepare<TParams extends SqliteValue[], TRow> (sql: string): IPreparedStatement<TParams, TRow> {
    const stmt = this.db.prepare(sql)
    return {
      run: (...params: TParams) => stmt.run(...params),
      get: (...params: TParams) => stmt.get(...params) as TRow | undefined,
      all: (...params: TParams) => stmt.all(...params) as TRow[]
    }
  }
}
