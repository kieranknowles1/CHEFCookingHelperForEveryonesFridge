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
import Recipe, { type ICsvRecipeRow } from './Recipe'
import type { Ingredient } from 'Ingredient'

const CSV_PARSER_OPTIONS: csv.Options = {
  // Use the first line for column names. Rows will be loaded as objects
  columns: true,
  // TODO: Parse the whole file, limit is just for testing
  to: 1000
}

// TODO: Use environment variables and put this somewhere outside the container
const INITIAL_DATA_PATH = path.join(process.cwd(), 'working_data/full_dataset.csv')

// TODO: Needs fine tuning
const MAX_INGREDIENTS = 100

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

async function getIngredientUsageCounts (): Promise<Map<Ingredient, number>> {
  const names = new Map<Ingredient, number>()
  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)

  return new Promise((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
    .pipe(progress)
    .pipe(csv.parse(CSV_PARSER_OPTIONS))
    .on('data', (data: ICsvRecipeRow) => {
      const recipe = Recipe.fromCsvRow(data)
      recipe.ingredients.forEach((amount, ingredient) => {
        names.set(ingredient, (names.get(ingredient) ?? 0) + 1)
      })
    })
    .on('end', () => {
      bar.stop()
      resolve(names)
    }))
}

/**
 * Filter ingredients to only the most common ones to keep the set of ingredients manageable
 */
function filterIngredients (raw: Map<Ingredient, number>): Set<Ingredient> {
  interface IngredientFrequency { ingredient: Ingredient, count: number }
  const byFrequency: IngredientFrequency[] = []

  raw.forEach((value, key) => {
    byFrequency.push({
      ingredient: key,
      count: value
    })
  })
  byFrequency.sort((a, b) => b.count - a.count)

  const out = new Set<Ingredient>()
  for (let i = 0; i < MAX_INGREDIENTS; i++) {
    out.add(byFrequency[i].ingredient)
  }

  return out
}

async function importData (): Promise<void> {
  const [progress, bar] = createTrackers(INITIAL_DATA_PATH)

  return ChefDatabase.Instance.wrapTransactionAsync(async (writable) => {
    return new Promise<void>((resolve, reject) => createReadStream(INITIAL_DATA_PATH)
      .pipe(progress)
      .pipe(csv.parse(CSV_PARSER_OPTIONS))
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
  ChefDatabase.Instance.setupSchema()

  console.log('Getting ingredient names')
  const ingredients = await getIngredientUsageCounts()

  console.log('Filtering to most common ingredients')
  const filtered = filterIngredients(ingredients)

  console.log(filtered)

  // console.log('Adding ingredients to database')
  // await addIngredientsToDatabase(ingredients)

  console.log('Importing data into the database')
  // TODO
  await importData()

  console.log('Setup done')
}
main().catch((err) => { console.error(err) })
