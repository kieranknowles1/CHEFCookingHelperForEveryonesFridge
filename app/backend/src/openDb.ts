import sqlite3 from 'sqlite3'
import path from 'path'

// TODO: Use environment variables and put this somewhere outside the container
const DATABASE_PATH = path.join(process.cwd(), 'working_data/database.sqlite')

export function openDb (): sqlite3.Database {
  return new sqlite3.Database(DATABASE_PATH)
}
