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

import logger, { LogLevel, logError } from '../logger'
import { type IRecipeNoId } from '../types/IRecipe'
import { type IngredientId } from '../types/IIngredient'
import getDatabase from '../database/getDatabase'
import { preloadModel } from '../ml/getModel'

import type ICsvRecipeRow from './ICsvRecipeRow'
import parseCsvRecipeRow from './parseCsvRecipeRow'

// TODO: Use environment variables and put this somewhere outside the container
const INITIAL_DATA_PATH = path.join(process.cwd(), 'working_data/full_dataset.csv')
const PROGRESS_BAR_STYLE = cliProgress.Presets.shades_classic

const MEAL_TYPES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack'
]

/**
 * Create a progress listener and bar and start the bar. The bar must be stopped once finished
 * @param path
 */
function createTrackers (path: string): [progressTracker.ProgressStream, cliProgress.Bar] {
  const bar = new cliProgress.SingleBar({}, PROGRESS_BAR_STYLE)
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

async function getCsvData (): Promise<[IRecipeNoId[], number]> {
  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)
  const supportedIngredients = getDatabase().getIngredientIds()

  let totalRows = 0
  const recipes: IRecipeNoId[] = []

  await new Promise<void>((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
    .pipe(progress)
    .pipe(csv.parse({ columns: true }))
    .on('data', (row: ICsvRecipeRow) => {
      totalRows++
      try {
        // Filter to only the most common ingredients
        if (recipeValid(row, supportedIngredients)) {
          const recipe = parseCsvRecipeRow(row)
          recipes.push(recipe)
        }
      } catch (err) {
        logError(err, LogLevel.verbose)
      }
    })
    .on('end', () => {
      bar.stop()
      resolve()
    })
    .on('error', err => { reject(err) })
  )

  return [recipes, totalRows]
}

async function addMealTypes (): Promise<void> {
  await getDatabase().wrapTransactionAsync(async (db) => {
    for (const mealType of MEAL_TYPES) {
      await db.addMealType(mealType)
    }
  })
}

interface ImportDataReturn { success: number, total: number }
async function importData (): Promise<ImportDataReturn> {
  logger.info('Collecting data from CSV')
  const [csvRecipes, csvTotalRows] = await getCsvData()

  logger.info('Importing data into the database')
  const bar = new cliProgress.SingleBar({}, PROGRESS_BAR_STYLE)
  bar.start(csvRecipes.length, 0)
  await getDatabase().wrapTransactionAsync(async (db) => {
    for (const recipe of csvRecipes) {
      bar.increment()
      await db.addRecipe(recipe)
    }
  })
  bar.stop()

  return {
    success: csvRecipes.length,
    total: csvTotalRows
  }
}

async function main (): Promise<void> {
  void preloadModel()

  logger.info('Setting up schema')
  getDatabase().resetDatabase('IKnowWhatIAmDoing')

  logger.info('Adding meal types')
  await addMealTypes()

  logger.info('Importing data into the database')
  const dataInfo = await importData()

  logger.info(`Setup done, imported ${dataInfo.success} of ${dataInfo.total} recipes (${(dataInfo.success / dataInfo.total) * 100}%)`)

  const missedFrequencies = Array.from(missedIngredients).sort((a, b) => b[1] - a[1])
  logger.info(`Missing ingredients by frequency: ${missedFrequencies.toString()}`)

  // Make sure nothing went wrong with the database
  getDatabase().checkIntegrity()
}
main().catch((err) => { logError(err) })
