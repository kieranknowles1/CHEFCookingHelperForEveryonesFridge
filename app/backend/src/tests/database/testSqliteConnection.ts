import assert from 'assert'
import path from 'path'

import { describe, it } from 'mocha'

import SqliteConnection, { CorruptDatabaseError, ForeignKeyCheckError } from '../../database/SqliteConnection'

describe('database/SqliteConnection', () => {
  describe('constructor', () => {
    it('should connect to an in-memory database', () => {
      const connection = new SqliteConnection(':memory:')
      assert.ok(connection)
    })

    it('should connect to a file database', () => {
      const connection = new SqliteConnection(path.join(__dirname, 'testdatabases', 'valid.db'))
      assert.ok(connection)
    })
  })

  describe('checkIntegrity', function () {
    it('should succeed for a valid database', () => {
      const connection = new SqliteConnection(path.join(__dirname, 'testdatabases', 'valid.db'))
      connection.checkIntegrity()
      assert.ok(true)
    })

    it('should fail for a corrupt database', () => {
      const connection = new SqliteConnection(path.join(__dirname, 'testdatabases', 'corrupt.db'))
      assert.throws(() => { connection.checkIntegrity() }, CorruptDatabaseError)
    })

    it('should fail for a database with foreign key errors', () => {
      const connection = new SqliteConnection(path.join(__dirname, 'testdatabases', 'badforeignkey.db'))
      assert.throws(() => { connection.checkIntegrity() }, ForeignKeyCheckError)
    })
  })
})
