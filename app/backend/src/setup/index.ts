/**
 * Set up the database ready for use by the app.
 * This script should be run using `npm run setup` before running the main script.
 */

import { createReadStream, readFileSync, statSync } from 'fs'
import path from 'path'

import * as t from 'io-ts'
import cliProgress from 'cli-progress'
import csv from 'csv-parse'
import progressTracker from 'progress-stream'

import logger, { createDefaultLogger, setLogger } from '../logger'
import CaseInsensitiveMap from '../types/CaseInsensitiveMap'
import CaseInsensitiveSet from '../types/CaseInsensitiveSet'
import ChefDatabaseImpl from '../database/ChefDatabaseImpl'
import type EmbeddedSentence from '../ml/EmbeddedSentence'
import type IChefDatabase from '../database/IChefDatabase'
import type IConnection from '../database/IConnection'
import type Ingredient from '../types/Ingredient'
import SqliteConnection from '../database/SqliteConnection'
import decodeObject from '../decodeObject'
import environment from '../environment'
import getEmbedding from '../ml/getEmbedding'
import getSimilarity from '../ml/getSimilarity'
import { preloadModel } from '../ml/getModel'

import DataImportError from './DataImportError'
import type ParsedCsvRecipe from './ParsedCsvRecipe'
import type RawCsvRecipe from './RawCsvRecipe'
import parseCsvRecipeRow from './parseCsvRecipeRow'

// TODO: Use environment variables and put this somewhere outside the container
const SQL_DUMMY_DATA_PATH = path.join(process.cwd(), 'data/dummydata.sql')
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
  const ingredients = decodeObject(t.array(t.string), JSON.parse(row.NER))
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

  const file = environment.SETUP_CSV_FILE
  logger.info(`Reading CSV file ${file}`)

  const [progress, bar] = createTrackers(file)
  await new Promise<void>((resolve, reject) => createReadStream(file)
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
        if (err instanceof DataImportError) {
          // These errors are expected and would just spam the log
          // Set the log level to silly if you need to debug these
          logger.silly(err.message)
        } else {
          logger.caughtError(err)
        }
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
  const embeddedMealTypes = await Promise.all(db.getMealTypeNames().map(getEmbedding))

  db.wrapTransaction(writable => {
    for (const mealType of embeddedMealTypes) {
      writable.addEmbedding(mealType)
    }
  })
}

async function importData (db: IChefDatabase): Promise<void> {
  logger.info('Collecting data from CSV')
  const [csvRecipes, csvTotalRows] = await getCsvData(db.ingredients.getAllWithAltNames())

  logger.info(`Imported ${csvRecipes.length} recipes from ${csvTotalRows} rows (${(csvRecipes.length / csvTotalRows) * 100}%) of CSV data`)

  // Log the missed ingredients
  // Skip entries with exactly 1 occurrence, these are probably typos or too specific to be useful
  const missedFrequencies = Array.from(missedIngredients)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])

  logger.info(`Missing ingredients by frequency: ${missedFrequencies.toString()}`)

  logger.info('Importing data into the database')
  const mealTypes = db.getMealTypes()

  logger.info('Embedding recipe names')

  const bar = new cliProgress.SingleBar({}, PROGRESS_BAR_STYLE)
  bar.start(csvRecipes.length, 0)
  const nameEmbeddings = new Map<string, EmbeddedSentence>()
  for (const recipe of csvRecipes) {
    if (!nameEmbeddings.has(recipe.name)) {
      nameEmbeddings.set(recipe.name, await getEmbedding(recipe.name))
    }
    bar.increment()
  }
  bar.stop()

  logger.info('Adding recipes to the database')
  bar.start(csvRecipes.length, 0)
  db.wrapTransaction(writable => {
    for (const recipe of csvRecipes) {
      const embeddedName = nameEmbeddings.get(recipe.name)
      if (embeddedName === undefined) {
        // Should never happen
        throw new Error('Recipe name was not embedded')
      }
      writable.addRecipe({
        ...recipe,
        name: embeddedName,
        mealType: predictMealType(embeddedName, mealTypes)
      })
      bar.increment()
    }
  })
  bar.stop()
}

async function main (connection: IConnection, db: IChefDatabase): Promise<void> {
  void preloadModel()

  logger.info('Setting up schema')
  db.resetDatabase('IKnowWhatIAmDoing')

  logger.info('Adding dummy data')
  const dummyData = readFileSync(SQL_DUMMY_DATA_PATH, 'utf-8')
  db.wrapTransaction(() => {
    connection.exec(dummyData)
  })

  logger.info('Adding meal types')
  await embedMealTypes(db)

  logger.info('Importing data into the database')
  await importData(db)

  logger.info('Setup done')

  // Make sure nothing went wrong with the database
  db.checkIntegrity()
}

setLogger(createDefaultLogger(environment.SETUP_LOG_FILE))

const connection = new SqliteConnection(environment.DATABASE_PATH)
const db = new ChefDatabaseImpl(connection)

main(connection, db).catch(err => {
  logger.caughtError(err)
  process.exit(1)
})
