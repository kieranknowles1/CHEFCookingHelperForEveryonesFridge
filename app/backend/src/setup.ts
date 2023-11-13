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
import { ingredientMapFactory, type IngredientId, UnparsedIngredientError } from './Ingredient'
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

function recipeValid (row: ICsvRecipeRow, commonIngredients: Map<string, IngredientId>): boolean {
  const ingredients = JSON.parse(row.NER) as string[]
  for (const ingredient of ingredients) {
    if (!commonIngredients.has(ingredient)) {
      return false
    }
  }
  return true
}

async function importData (): Promise<void> {
  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)

  const supportedIngredients = ChefDatabase.Instance.getIngredientIds()

  return ChefDatabase.Instance.wrapTransactionAsync(async (writable) => {
    return new Promise<void>((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
      .pipe(progress)
      .pipe(csv.parse(CSV_PARSER_OPTIONS))
      .on('data', (row: ICsvRecipeRow) => {
        try {
          // Filter to only the most common ingredients
          if (recipeValid(row, supportedIngredients)) {
            const recipe = Recipe.fromCsvRow(row)
            writable.addRecipe(recipe)
          }
        } catch (err) {
          if (err instanceof UnparsedIngredientError) {
            logError(err, 'verbose')
          } else {
            throw err
          }
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

  logger.log('info', 'Importing data into the database')
  // TODO
  await importData()

  logger.log('info', 'Setup done')
}
main().catch((err) => { logError(err) })
