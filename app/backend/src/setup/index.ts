/**
 * Set up the database ready for use by the app.
 * This script should be run using `npm run setup` before running the main script.
 */

import { createReadStream, statSync } from 'fs'
import path from 'path'

import cliProgress from 'cli-progress'
import csv from 'csv-parse'
import progressTracker from 'progress-stream'

import logger, { LogLevel, logError } from '../logger'
import CaseInsensitiveMap from '../types/CaseInsensitiveMap'
import type IEmbeddedSentence from '../ml/IEmbeddedSentence'
import { type IngredientId } from '../types/IIngredient'
import getDatabase from '../database/getDatabase'
import getEmbedding from '../ml/getEmbedding'
import getSimilarity from '../ml/getSimilarity'
import { preloadModel } from '../ml/getModel'

import type IParsedCsvRecipe from './IParsedCsvRecipe'
import type IRawCsvRecipe from './IRawCsvRecipe'
import parseCsvRecipeRow from './parseCsvRecipeRow'

// TODO: Use environment variables and put this somewhere outside the container
const INITIAL_DATA_PATH = path.join(process.cwd(), 'working_data/full_dataset.csv')
const PROGRESS_BAR_STYLE = cliProgress.Presets.shades_classic

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
const missedIngredients = new CaseInsensitiveMap<number>()

function recipeValid (row: IRawCsvRecipe, commonIngredients: Map<string, IngredientId>): boolean {
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

async function getCsvData (): Promise<[IParsedCsvRecipe[], number]> {
  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)
  const supportedIngredients = getDatabase().getIngredientIds()

  let totalRows = 0
  const recipes: IParsedCsvRecipe[] = []

  await new Promise<void>((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
    .pipe(progress)
    .pipe(csv.parse({ columns: true }))
    .on('data', (row: IRawCsvRecipe) => {
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

function predictMealType (recipeName: IEmbeddedSentence, mealTypes: IEmbeddedSentence[]): IEmbeddedSentence {
  let best = mealTypes[0]
  let bestSimilarity = getSimilarity(recipeName.embedding, best.embedding)

  for (const mealType of mealTypes) {
    const similarity = getSimilarity(recipeName.embedding, mealType.embedding)
    if (similarity > bestSimilarity) {
      best = mealType
      bestSimilarity = similarity
    }
  }

  return best
}

// Add embeddings for the meal types
// Can't be done in pure SQL as async functions are not supported
async function embedMealTypes (): Promise<void> {
  await getDatabase().wrapTransactionAsync(async (db) => {
    for (const mealType of getDatabase().getMealTypeNames()) {
      db.addEmbedding(await getEmbedding(mealType))
    }
  })
}

interface ImportDataReturn { success: number, total: number }
async function importData (): Promise<ImportDataReturn> {
  logger.info('Collecting data from CSV')
  const [csvRecipes, csvTotalRows] = await getCsvData()

  logger.info('Importing data into the database')
  const mealTypes = getDatabase().getMealTypes()

  const bar = new cliProgress.SingleBar({}, PROGRESS_BAR_STYLE)
  bar.start(csvRecipes.length, 0)

  await getDatabase().wrapTransactionAsync(async (db) => {
    for (const recipe of csvRecipes) {
      const nameEmbedding = await getEmbedding(recipe.name)
      db.addEmbedding(nameEmbedding)
      db.addRecipe({
        ...recipe,
        name: await getEmbedding(recipe.name),
        mealType: predictMealType(nameEmbedding, mealTypes)
      })

      bar.increment()
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
  await embedMealTypes()

  logger.info('Importing data into the database')
  const dataInfo = await importData()

  logger.info(`Setup done, imported ${dataInfo.success} of ${dataInfo.total} recipes (${(dataInfo.success / dataInfo.total) * 100}%)`)

  const missedFrequencies = Array.from(missedIngredients).sort((a, b) => b[1] - a[1])
  logger.info(`Missing ingredients by frequency: ${missedFrequencies.toString()}`)

  // Make sure nothing went wrong with the database
  getDatabase().checkIntegrity()
}
main().catch((err) => { logError(err) })
