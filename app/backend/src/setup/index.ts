/**
 * Set up the database ready for use by the app.
 * This script should be run using `npm run setup` before running the main script.
 */

import { createReadStream, statSync } from 'fs'
import path from 'path'

import cliProgress from 'cli-progress'
import csv from 'csv-parse'
import progressTracker from 'progress-stream'

import CaseInsensitiveMap from '../types/CaseInsensitiveMap'
import CaseInsensitiveSet from '../types/CaseInsensitiveSet'
import ChefDatabaseImpl from '../database/ChefDatabaseImpl'
import { DATABASE_PATH } from '../settings'
import type EmbeddedSentence from '../ml/EmbeddedSentence'
import type IChefDatabase from '../database/IChefDatabase'
import type Ingredient from '../types/Ingredient'
import SqliteConnection from '../database/SqliteConnection'
import getEmbedding from '../ml/getEmbedding'
import getSimilarity from '../ml/getSimilarity'
import logger from '../logger'
import { preloadModel } from '../ml/getModel'

import type ParsedCsvRecipe from './ParsedCsvRecipe'
import type RawCsvRecipe from './RawCsvRecipe'
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

function recipeValid (row: RawCsvRecipe, ingredientNames: CaseInsensitiveSet): boolean {
  let valid = true
  const ingredients = JSON.parse(row.NER) as string[]
  for (const ingredient of ingredients) {
    if (!ingredientNames.has(ingredient)) {
      missedIngredients.set(ingredient, (missedIngredients.get(ingredient) ?? 0) + 1)
      valid = false
    }
  }
  return valid
}

async function getCsvData (ingredients: CaseInsensitiveMap<Ingredient>): Promise<[ParsedCsvRecipe[], number]> {
  const ingredientNames = new CaseInsensitiveSet(ingredients.keys())

  let totalRows = 0
  const recipes: ParsedCsvRecipe[] = []

  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)
  await new Promise<void>((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
    .pipe(progress)
    .pipe(csv.parse({ columns: true }))
    .on('data', (row: RawCsvRecipe) => {
      totalRows++
      try {
        // Filter to only the most common ingredients
        if (recipeValid(row, ingredientNames)) {
          const recipe = parseCsvRecipeRow(row, ingredients)
          recipes.push(recipe)
        }
      } catch (err) {
        logger.caughtError(err)
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

function predictMealType (recipeName: EmbeddedSentence, mealTypes: EmbeddedSentence[]): EmbeddedSentence {
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
async function embedMealTypes (db: IChefDatabase): Promise<void> {
  await db.wrapTransactionAsync(async (writable) => {
    for (const mealType of db.getMealTypeNames()) {
      writable.addEmbedding(await getEmbedding(mealType))
    }
  })
}

interface ImportDataReturn { success: number, total: number }
async function importData (db: IChefDatabase): Promise<ImportDataReturn> {
  logger.info('Collecting data from CSV')
  const [csvRecipes, csvTotalRows] = await getCsvData(db.getAllIngredientsByName())

  logger.info('Importing data into the database')
  const mealTypes = db.getMealTypes()

  const bar = new cliProgress.SingleBar({}, PROGRESS_BAR_STYLE)
  bar.start(csvRecipes.length, 0)

  await db.wrapTransactionAsync(async (writable) => {
    for (const recipe of csvRecipes) {
      const nameEmbedding = await getEmbedding(recipe.name)
      writable.addEmbedding(nameEmbedding)
      writable.addRecipe({
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

async function main (db: IChefDatabase): Promise<void> {
  void preloadModel()

  logger.info('Setting up schema')
  db.resetDatabase('IKnowWhatIAmDoing')

  logger.info('Adding meal types')
  await embedMealTypes(db)

  logger.info('Importing data into the database')
  const dataInfo = await importData(db)

  logger.info(`Setup done, imported ${dataInfo.success} of ${dataInfo.total} recipes (${(dataInfo.success / dataInfo.total) * 100}%)`)

  const missedFrequencies = Array.from(missedIngredients).sort((a, b) => b[1] - a[1])
  logger.info(`Missing ingredients by frequency: ${missedFrequencies.toString()}`)

  // Make sure nothing went wrong with the database
  db.checkIntegrity()
}

const db = new ChefDatabaseImpl(new SqliteConnection(DATABASE_PATH))

main(db).catch(err => {
  logger.caughtError(err)
  process.exit(1)
})
