/**
 * Set up the database ready for use by the app.
 * This script should be run using `npm run setup` before running the main script.
 */

import { type Database } from 'sqlite'
import path from 'path'
import { readFile } from 'fs/promises'
import { openDb } from './openDb'

// TODO: Use environment variables and put this somewhere outside the container
const INITIAL_DATA_PATH = path.join(process.cwd(), 'working_data/full_dataset.csv')
const SCHEMA_PATH = path.join(process.cwd(), 'data/schema.sql')

async function setupSchema (db: Database): Promise<void> {
  const schema = await readFile(SCHEMA_PATH, 'utf-8')
  await db.exec(schema)
}

async function main (): Promise<void> {
  const db = await openDb()

  await setupSchema(db)
}

main().catch((ex) => { throw ex })
