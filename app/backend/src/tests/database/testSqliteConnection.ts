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

  let testdatabase: SqliteConnection
  beforeEach(() => {
    testdatabase = new SqliteConnection(':memory:')
    testdatabase.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)')
    testdatabase.exec("INSERT INTO test (id, name) VALUES (123, 'test')")
  })
  describe('exec', () => {
    it('should execute a statement', () => {
      testdatabase.exec("INSERT INTO test (id, name) VALUES (1234, 'test2')")
      const result = testdatabase.prepare<[], { id: number }>("SELECT id FROM test WHERE name = 'test2'").get()
      assert.strictEqual(result?.id, 1234)
    })
  })

  describe('prepare', () => {
    it('should prepare a statement', () => {
      const statement = testdatabase.prepare<[], { id: number }>("SELECT id FROM test WHERE name = 'test'")
      const result = statement.get()
      assert.strictEqual(result?.id, 123)
    })

    it('should throw an error if the statement is invalid', () => {
      assert.throws(() => { testdatabase.prepare<[], { id: number }>('SELECT id FROM test WHERE "') })
    })

    describe('run', () => {
      it('should run a statement', () => {
        const statement = testdatabase.prepare<[], { id: number }>("INSERT INTO test (name) VALUES ('test3')")
        const result = statement.run()
        assert.strictEqual(result.changes, 1)
      })
    })

    describe('get', () => {
      it('should get a row', () => {
        const statement = testdatabase.prepare<[], { id: number }>("SELECT id FROM test WHERE name = 'test'")
        const result = statement.get()
        assert.strictEqual(result?.id, 123)
      })
    })

    describe('all', () => {
      it('should get all rows', () => {
        testdatabase.exec("INSERT INTO test (id, name) VALUES (124, 'test2')")
        const statement = testdatabase.prepare<[], { id: number }>('SELECT id FROM test ORDER BY id ASC')
        const result = statement.all()
        assert.deepStrictEqual(result, [{ id: 123 }, { id: 124 }])
      })
    })
  })
})
