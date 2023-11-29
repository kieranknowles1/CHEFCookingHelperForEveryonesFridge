/**
 * Set up the database ready for use by the app.
 * This script should be run using `npm run setup` before running the main script.
 */

import { createReadStream, statSync } from 'fs'
import path from 'path'

import CiMap from '@glossa-glo/case-insensitive-map'
import cliProgress from 'cli-progress'
import csv from 'csv-parse'
import progressTracker from 'progress-stream'

import logger, { logError } from '../logger'
import { type IngredientId } from '../types/IIngredient'
import getDatabase from '../database/getDatabase'

import type ICsvRecipeRow from './ICsvRecipeRow'
import { UnparsedIngredientError } from './parseIngredients'
import parseCsvRecipeRow from './parseCsvRecipeRow'

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

/** Map of missed ingredient => frequency */
const missedIngredients = new CiMap<string, number>()

function recipeValid (row: ICsvRecipeRow, commonIngredients: Map<string, IngredientId>): boolean {
  let valid = true
  const ingredients = JSON.parse(row.NER) as string[]
  for (const ingredient of ingredients) {
    if (!commonIngredients.has(ingredient)) {
      missedIngredients.set(ingredient, (missedIngredients.get(ingredient) ?? 0) + 1)
      valid = false
    }
  }
  return valid
}

interface ImportDataReturn { success: number, total: number }
async function importData (): Promise<ImportDataReturn> {
  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)

  const supportedIngredients = getDatabase().getIngredientIds()

  let total = 0
  let success = 0

  return await getDatabase().wrapTransactionAsync<ImportDataReturn>(async (writable) => {
    return await new Promise<ImportDataReturn>((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
      .pipe(progress)
      .pipe(csv.parse({ columns: true }))
      .on('data', (row: ICsvRecipeRow) => {
        total++
        try {
          // Filter to only the most common ingredients
          if (recipeValid(row, supportedIngredients)) {
            const recipe = parseCsvRecipeRow(row)
            writable.addRecipe(recipe)
            success++
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
        resolve({
          total,
          success
        })
      })
      .on('error', err => { reject(err) })
    )
  })
}

async function main (): Promise<void> {
  logger.log('info', 'Setting up schema')
  getDatabase().resetDatabase('IKnowWhatIAmDoing')

  logger.log('info', 'Importing data into the database')
  const dataInfo = await importData()

  logger.log('info', `Setup done, imported ${dataInfo.success} of ${dataInfo.total} recipes (${(dataInfo.success / dataInfo.total) * 100}%)`)

  const missedFrequencies = Array.from(missedIngredients).sort((a, b) => b[1] - a[1])
  logger.log('info', `Missing ingredients by frequency: ${missedFrequencies.toString()}`)
}
main().catch((err) => { logError(err) })
