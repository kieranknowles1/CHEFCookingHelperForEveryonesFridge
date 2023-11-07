/**
 * Set up the database ready for use by the app.
 * This script should be run using `npm run setup` before running the main script.
 */

import { createReadStream, statSync, readFileSync } from 'fs'
import { type Database } from 'sqlite3'
import cliProgress from 'cli-progress'
import csv from 'csv-parse'
import path from 'path'
import progressTracker from 'progress-stream'

import { openDb } from './openDb'

// TODO: Use environment variables and put this somewhere outside the container
const INITIAL_DATA_PATH = path.join(process.cwd(), 'working_data/full_dataset.csv')
const SCHEMA_PATH = path.join(process.cwd(), 'data/schema.sql')

function setupSchema (db: Database): void {
  const schema = readFileSync(SCHEMA_PATH, 'utf-8')
  db.exec(schema)
}

function addRow (db: Database, row: any): void {
  // TODO: Handle the ingredients and convert directions to one string. Probably need a separate pass to gather ingredients first
  db.run('INSERT INTO recipe (name, directions, link) VALUES (?, ?, ?)', row.title, row.directions, row.link)
}

function loadData (db: Database): void {
  // Run everything within a transaction in order to reduce I/O workload
  db.run('BEGIN TRANSACTION')
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
      db.run('COMMIT')
    })
}

const db = openDb()

console.log('Setting up schema')
setupSchema(db)

console.log('Importing data into the database')
loadData(db)
