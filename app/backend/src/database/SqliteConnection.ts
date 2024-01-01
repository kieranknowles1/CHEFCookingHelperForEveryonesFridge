// Allow type assertions here because the user of this class is expected to provide the correct types
// for the statement results
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import sqlite from 'better-sqlite3'

import logger from '../logger'

import { type FunctionOptions, type IPreparedStatement, type SqliteValue } from './IConnection'
import type IConnection from './IConnection'

interface IntegrityCheckRow {
  integrity_check: string
}

interface ForeignKeyCheckRow {
  table: string
  rowid: number
  parent: string
  fkid: number
}

export abstract class IntegrityCheckError extends Error {}

export class CorruptDatabaseError extends IntegrityCheckError {
  constructor (result: IntegrityCheckRow[]) {
    super(`Database is corrupt: ${JSON.stringify(result)}`)
    this.name = 'CorruptDatabaseError'
  }
}

export class ForeignKeyCheckError extends IntegrityCheckError {
  constructor (result: ForeignKeyCheckRow[]) {
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
    const integrityCheck = this.db.pragma('integrity_check') as IntegrityCheckRow[]
    if (integrityCheck.length !== 1 || integrityCheck[0].integrity_check !== 'ok') {
      throw new CorruptDatabaseError(integrityCheck)
    }

    // Expecting this to not return anything
    const foreignKeyCheck = this.db.pragma('foreign_key_check') as ForeignKeyCheckRow[]
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
