/**
 * Set up the database ready for use by the app.
 * This script should be run using `npm run setup` before running the main script.
 */

import { createReadStream, statSync } from 'fs'
import cliProgress from 'cli-progress'
import csv from 'csv-parse'
import path from 'path'
import progressTracker from 'progress-stream'

import ChefDatabase from 'ChefDatabase'
import Recipe, { type ICsvRecipeRow } from 'Recipe'

// TODO: Use environment variables and put this somewhere outside the container
const INITIAL_DATA_PATH = path.join(process.cwd(), 'working_data/full_dataset.csv')

// TODO: Needs fine tuning
const MIN_INGREDIENT_OCCURENCES = 1000

/**
 * Create a progress listener and bar and start the bar. The bar must be stopped once finished
 * @param path
 */
function createTrackers (path: string): [progressTracker.ProgressStream, cliProgress.Bar] {
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

      // Filter out ingredients that appear less than a set number of times. This likely means it is too similar and/or a misspelling
      names.forEach((value, key) => {
        if (value < MIN_INGREDIENT_OCCURENCES) {
          names.delete(key)
        }
      })
    }))
}

async function addIngredientsToDatabase (ingredients: Map<string, number>): Promise<void> {
  // TODO: Implement
}

async function importData (ingredients: Map<string, number>): Promise<void> {
  // Run everything within a transaction in order to reduce I/O workload

  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)

  return ChefDatabase.Instance.wrapTransactionAsync(async (writable) => {
    return new Promise<void>((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
      .pipe(progress)
      .pipe(csv.parse({ columns: true }))
      .on('data', (data: ICsvRecipeRow) => {
        const recipe = Recipe.fromCsvRow(data)

        writable.addRecipe(recipe)
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
  ChefDatabase.Instance.wrapTransaction((writable) => { writable.setupSchema() })

  console.log('Getting ingredient names')
  const ingredients = await getIngredientNames()

  console.log('Adding ingredients to database')
  await addIngredientsToDatabase(ingredients)

  console.log('Importing data into the database')
  // TODO
  await importData(ingredients)

  console.log('Setup done')
}
main().catch((ex) => { throw ex })
