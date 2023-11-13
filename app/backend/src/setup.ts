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
import { ingredientMapFactory, type IngredientId } from './Ingredient'
import logger, { logError } from './logger'

const CSV_PARSER_OPTIONS: csv.Options = {
  // Use the first line for column names. Rows will be loaded as objects
  columns: true,
  // TODO: Parse the whole file, limit is just for testing
  to: 10000
}

// TODO: Use environment variables and put this somewhere outside the container
const INITIAL_DATA_PATH = path.join(process.cwd(), 'working_data/full_dataset.csv')

/** The sample size for determining the most common ingredients */
const DATASET_SAMPLE_SIZE = 10000
/** The number of ingredients to use, selected from the most common */
const NUM_INGREDIENTS = 100

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

/**
 * Find the most common ingredients in the dataset from a subset of its entries
 */
async function findCommonIngredients (): Promise<Set<IngredientId>> {
  const frequencies = ingredientMapFactory()

  return new Promise<Set<IngredientId>>((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
    .pipe(csv.parse({ columns: true, to: DATASET_SAMPLE_SIZE }))
    .on('data', (row: ICsvRecipeRow) => {
      try {
        const recipe = Recipe.fromCsvRow(row)
        recipe.ingredients.forEach((value, key) => {
          frequencies.set(key, (frequencies.get(key) ?? 0) + 1)
        })
      } catch (err) {
        logError(err, 'verbose')
      }
    })
    .on('end', () => {
      const entries = Array.from(frequencies.entries())
      entries.sort((a, b) => b[1] - a[1])
      resolve(new Set(entries.slice(0, NUM_INGREDIENTS).map(entry => entry[0])))
    })
    .on('error', err => { reject(err) })
  )
}

function recipeValid (recipe: Recipe, commonIngredients: Set<IngredientId>): boolean {
  let valid = true
  recipe.ingredients.forEach((value, key) => {
    if (!commonIngredients.has(key)) {
      valid = false
    }
  })
  return valid
}

async function importData (commonIngredients: Set<IngredientId>): Promise<void> {
  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)

  return ChefDatabase.Instance.wrapTransactionAsync(async (writable) => {
    return new Promise<void>((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
      .pipe(progress)
      .pipe(csv.parse(CSV_PARSER_OPTIONS))
      .on('data', (data: ICsvRecipeRow) => {
        try {
          const recipe = Recipe.fromCsvRow(data)
          // Filter to only the most common ingredients
          if (recipeValid(recipe, commonIngredients)) {
            writable.addRecipe(recipe)
          }
        } catch (err) {
          logError(err, 'verbose')
        }
      })
      .on('end', () => {
        bar.stop()
        resolve()
      })
      .on('error', err => { reject(err) })
    )
  })
}

async function main (): Promise<void> {
  logger.log('info', 'Setting up schema')
  ChefDatabase.Instance.setupSchema()

  logger.log('info', 'Finding the most common ingredients')
  const commonIngredients = await findCommonIngredients()

  logger.log('info', 'Importing data into the database')
  // TODO
  await importData(commonIngredients)

  logger.log('info', 'Setup done')
}
main().catch((err) => { logError(err) })
