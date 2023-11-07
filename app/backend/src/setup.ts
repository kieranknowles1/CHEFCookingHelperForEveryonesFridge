/**
 * Set up the database ready for use by the app.
 * This script should be run using `npm run setup` before running the main script.
 */

import { createReadStream, statSync } from 'fs'
import { readFile } from 'fs/promises'
import { type Database } from 'sqlite'
import cliProgress from 'cli-progress'
import csv from 'csv-parse'
import path from 'path'
import progressTracker from 'progress-stream'

import { openDb } from './openDb'

// TODO: Use environment variables and put this somewhere outside the container
const INITIAL_DATA_PATH = path.join(process.cwd(), 'working_data/full_dataset.csv')
const SCHEMA_PATH = path.join(process.cwd(), 'data/schema.sql')

async function setupSchema (db: Database): Promise<void> {
  const schema = await readFile(SCHEMA_PATH, 'utf-8')
  await db.exec(schema)
}

function addRow (db: Database, row: any): void {
  // TODO: Handle the ingredients and convert directions to one string. Probably need a separate pass to gather ingredients first
  db.run('INSERT INTO recipe (name, directions, link) VALUES (?, ?, ?)', row.title, row.directions, row.link).catch((ex) => { throw ex })
}

async function loadData (db: Database): Promise<void> {
  // Run everything within a transaction in order to reduce I/O workload
  await db.run('BEGIN TRANSACTION')
  const total = statSync(INITIAL_DATA_PATH).size

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  bar.start(total, 0)

  const progressStream = progressTracker({
    length: total,
    time: 100 /* ms */
  }).on('progress', (progressStat) => {
    bar.update(progressStat.transferred)
  })

  createReadStream(INITIAL_DATA_PATH)
    .pipe(progressStream)
    .pipe(csv.parse({ columns: true }))
    .on('data', (data) => {
      addRow(db, data)
    })
    .on('end', () => {
      bar.stop()
      db.run('COMMIT').catch((ex) => { throw ex })
    })
}

async function main (): Promise<void> {
  const db = await openDb()

  console.log('Setting up schema')
  await setupSchema(db)

  console.log('Importing data into the database')
  await loadData(db)
}

main().catch((ex) => { throw ex })
