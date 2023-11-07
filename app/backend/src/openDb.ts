import sqlite3 from 'sqlite3'
import { open, type Database } from 'sqlite'
import path from 'path'

// TODO: Use environment variables and put this somewhere outside the container
const DATABASE_PATH = path.join(process.cwd(), 'working_data/database.sqlite')

export async function openDb (): Promise<Database> {
  return await open({
    filename: DATABASE_PATH,
    driver: sqlite3.Database
  })
}
