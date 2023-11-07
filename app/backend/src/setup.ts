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
// TODO: Needs fine tuning
const MIN_INGREDIENT_OCCURENCES = 1000

/**
 * Create a progress listener and bar and start the bar. The bar must be stopped once finished
 * @param path
 */
function createTrackers(path: string): [progressTracker.ProgressStream, cliProgress.Bar] {
  const total = statSync(path).size

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  bar.start(total, 0)

  const progress = progressTracker({
    length: total,
    time: 100 /* ms */
  }).on('progress', (progressStat) => {
    bar.update(progressStat.transferred)
  })

  return [progress, bar]
}

function setupSchema (db: Database): void {
  const schema = readFileSync(SCHEMA_PATH, 'utf-8')
  db.exec(schema)
}

async function getIngredientNames (): Promise<Map<string, number>> {
  const names = new Map<string, number>()
  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)

  return new Promise((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
    .pipe(progress)
    .pipe(csv.parse({ columns: true }))
    .on('data', (data) => {
      const ingredients = JSON.parse(data.NER) as string[]
      ingredients.forEach(item => {
        const lower = item.toLowerCase()
        names.set(lower, (names.get(lower) ?? 0) + 1)
      })
    })
    .on('end', () => {
      bar.stop()
      resolve(names)
    }))
}

async function parseIngredients (db: Database): Promise<void> {
  console.log('Getting ingredient names')
  const list = await getIngredientNames()

  // Filter out ingredients that appear less than a set number of times. This likely means it is too similar and/or a misspelling
  list.forEach((value, key) => {
    if (value < MIN_INGREDIENT_OCCURENCES) {
      list.delete(key)
    }
  })

  console.log(list)
  console.log(`Found ${list.size} unique ingredients.`)
}

function addRow (db: Database, row: any): void {
  // TODO: Handle the ingredients and convert directions to one string. Probably need a separate pass to gather ingredients first
  db.run('INSERT INTO recipe (name, directions, link) VALUES (?, ?, ?)', row.title, row.directions, row.link)
}

async function importData (db: Database): Promise<void> {
  // Run everything within a transaction in order to reduce I/O workload
  db.run('BEGIN TRANSACTION')

  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)

  return new Promise<void>((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
    .pipe(progress)
    .pipe(csv.parse({ columns: true }))
    .on('data', (data) => {
      addRow(db, data)
    })
    .on('end', () => {
      bar.stop()
      db.run('COMMIT')
      resolve()
    })
  )
}

async function main (): Promise<void> {
  const db = openDb()

  console.log('Setting up schema')
  setupSchema(db)

  console.log('Getting ingredients')
  await parseIngredients(db)

  console.log('Importing data into the database')
  // TODO
  //await importData(db)

  console.log('Setup done')
}
main().catch((ex) => { throw ex })
