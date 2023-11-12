/**
 * Set up the database ready for use by the app.
 * This script should be run using `npm run setup` before running the main script.
 */

import { createReadStream, statSync } from 'fs'
import cliProgress from 'cli-progress'
import csv from 'csv-parse'
import path from 'path'
import progressTracker from 'progress-stream'

import ChefDatabase from './ChefDatabase'
import Recipe from './Recipe'
import type ICsvRecipeRow from './ICsvRecipeRow'

const CSV_PARSER_OPTIONS: csv.Options = {
  // Use the first line for column names. Rows will be loaded as objects
  columns: true,
  // TODO: Parse the whole file, limit is just for testing
  to: 1000
}

// TODO: Use environment variables and put this somewhere outside the container
const INITIAL_DATA_PATH = path.join(process.cwd(), 'working_data/full_dataset.csv')

/**
 * Create a progress listener and bar and start the bar. The bar must be stopped once finished
 * @param path
 */
function createTrackers (path: string): [progressTracker.ProgressStream, cliProgress.Bar] {
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  bar.start(100, 0)

  const progress = progressTracker({
    length: statSync(path).size,
    time: 100 /* ms */
  }).on('progress', (progressStat) => {
    bar.update(progressStat.percentage)
  })

  return [progress, bar]
}

async function importData (): Promise<void> {
  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)

  return ChefDatabase.Instance.wrapTransactionAsync(async (writable) => {
    return new Promise<void>((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
      .pipe(progress)
      .pipe(csv.parse(CSV_PARSER_OPTIONS))
      .on('data', (data: ICsvRecipeRow) => {
        try {
          const recipe = Recipe.fromCsvRow(data)
          writable.addRecipe(recipe)
        } catch (ex) {
          console.error(data.NER)
          console.error(ex)
        }
      })
      .on('end', () => {
        bar.stop()
        resolve()
      })
      .on('error', (err) => { reject(err) })
    )
  })
}

async function main (): Promise<void> {
  console.log('Setting up schema')
  ChefDatabase.Instance.setupSchema()

  console.log('Importing data into the database')
  // TODO
  await importData()

  console.log('Setup done')
}
main().catch((err) => { console.error(err) })
