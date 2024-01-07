/* eslint-disable @typescript-eslint/consistent-type-assertions */
import path from 'path'
import { readFileSync } from 'fs'

import { type AvailableRecipe } from '../types/Recipe'
import type Barcode from '../types/Barcode'
import type EmbeddedSentence from '../ml/EmbeddedSentence'
import type Fridge from '../types/Fridge'
import logger from '../logger'
import ml_extendDatabase from '../ml/extendDatabase'

import type * as types from './types'
import {
  type FridgeIngredientAmount,
  type IIngredientDatabase,
  type IRecipeDatabase,
  type IUserDatabase,
  type IWritableDatabase
} from './IChefDatabase'
import type IChefDatabase from './IChefDatabase'
import type IConnection from './IConnection'
import IngredientDatabaseImpl from './IngredientDatabaseImpl'
import InvalidIdError from './InvalidIdError'
import RecipeDatabaseImpl from './RecipeDatabaseImpl'
import UserDatabaseImpl from './UserDatabaseImpl'
import WritableDatabaseImpl from './WritableDatabaseImpl'
import { bufferToFloat32Array } from './bufferFloat32Array'
import ingredientFromRow from './ingredientFromRow'

const SCHEMA_PATH = path.join(process.cwd(), 'data/schema.sql')
const INITIAL_DATA_PATH = path.join(process.cwd(), 'data/initialdata.sql')

interface AvailableRecipesResultRow {
  id: types.RowId
  name: string
  // JSON array -> number[]
  recipe_amount: string
  // JSON array -> number[]
  fridge_amount: string
  missing_count: number
}

export default class ChefDatabaseImpl implements IChefDatabase {
  private readonly _connection: IConnection

  public readonly ingredients: IIngredientDatabase
  public readonly recipes: IRecipeDatabase
  public readonly users: IUserDatabase

  public constructor (connection: IConnection) {
    this._connection = connection
    this.ingredients = new IngredientDatabaseImpl(connection)
    this.recipes = new RecipeDatabaseImpl(connection)
    this.users = new UserDatabaseImpl(connection)

    ml_extendDatabase(this._connection)
  }

  /**
   * Run the schema and initial script. Should only be used during setup
   *
   * WARN: This will delete ALL data from the database.
   */
  public resetDatabase (_: 'IKnowWhatIAmDoing'): void {
    logger.info('Running schema script')
    const schema = readFileSync(SCHEMA_PATH, 'utf-8')
    this._connection.exec(schema)
    logger.info('Running initial data script')
    const initialData = readFileSync(INITIAL_DATA_PATH, 'utf-8')
    this._connection.exec(initialData)
  }

  public checkIntegrity (): void {
    const start = Date.now()

    logger.info('Checking database integrity')
    this._connection.checkIntegrity()

    const end = Date.now()

    logger.info(`Database integrity check passed in ${end - start}ms`)
  }

  /**
   * Wrap `callback` within a transaction. Must be used for any operations that write to the database
   * The transaction will be rolled back if an uncaught exception occurs and the exception re-thrown
   */
  public wrapTransaction<TReturn = void> (callback: (db: IWritableDatabase) => TReturn): TReturn {
    const writable = new WritableDatabaseImpl(this, this._connection)
    try {
      this._connection.exec('BEGIN TRANSACTION')
      const data = callback(writable)
      this._connection.exec('COMMIT')
      return data
    } catch (ex) {
      this._connection.exec('ROLLBACK')
      throw ex
    } finally {
      writable.close()
    }
  }

  public getEmbedding (sentence: string): EmbeddedSentence | null {
    const statement = this._connection.prepare<{ embedding: Buffer }>(`
      SELECT embedding FROM embedding WHERE sentence = :sentence
    `)
    const result = statement.get({ sentence })

    if (result === undefined) {
      return null
    }

    return {
      embedding: bufferToFloat32Array(result.embedding),
      sentence
    }
  }

  getMealTypeNames (): string[] {
    interface Result { name: string }
    const statement = this._connection.prepare<Result>(`
      SELECT name FROM meal_type
    `)
    const result = statement.all()

    return result.map(row => row.name)
  }

  getMealTypes (): EmbeddedSentence[] {
    interface Result { name: string, embedding: Buffer }
    const statement = this._connection.prepare<Result>(`
      SELECT
        name, embedding
      FROM meal_type
        JOIN embedding ON meal_type.name = embedding.sentence
    `)
    const result = statement.all()

    return result.map(row => ({
      sentence: row.name,
      embedding: bufferToFloat32Array(row.embedding)
    }))
  }

  /**
   * Get the amount of an ingredient in a fridge
   */
  public getIngredientAmount (fridgeId: types.RowId, ingredientId: types.RowId): number {
    const statement = this._connection.prepare<{ amount: number }>(`
      SELECT amount
      FROM fridge_ingredient
      WHERE fridge_id = :fridgeId AND ingredient_id = :ingredientId
    `)
    const result = statement.get({ fridgeId, ingredientId })

    return result?.amount ?? 0
  }

  /**
   * Get all ingredient amounts in a fridge
   */
  public getAllIngredientAmounts (fridgeId: types.RowId): Map<types.RowId, FridgeIngredientAmount> {
    type IAllIngredientAmountsRow = types.IngredientRow & types.FridgeIngredientRow
    const statement = this._connection.prepare<IAllIngredientAmountsRow>(`
      SELECT *
      FROM fridge_ingredient
      JOIN ingredient ON ingredient.id = fridge_ingredient.ingredient_id
      WHERE fridge_id = :fridgeId
      ORDER BY ingredient.name
    `)
    const result = statement.all({ fridgeId })

    const map = new Map<types.RowId, FridgeIngredientAmount>()
    for (const row of result) {
      map.set(row.ingredient_id, {
        amount: row.amount,
        ingredient: ingredientFromRow(row)
      })
    }
    return map
  }

  private getInsufficientAmountCount (row: AvailableRecipesResultRow): number {
    const neededAmounts = JSON.parse(row.recipe_amount) as number[]
    const availableAmounts = JSON.parse(row.fridge_amount) as number[]

    return neededAmounts.filter((needed, index) => availableAmounts[index] < needed).length
  }

  public getAvailableRecipes (fridgeId: types.RowId, checkAmount: boolean, maxMissingIngredients: number, mealType: string | null): AvailableRecipe[] {
    // Well this was easier than expected
    // TODO: Optionally allow substitutions
    const statement = this._connection.prepare<AvailableRecipesResultRow>(`
      SELECT
        recipe.name, recipe.id,
        -- Used to filter by available amount later
        json_group_array(recipe_ingredient.amount) AS recipe_amount,
        json_group_array(fridge_ingredient.amount) AS fridge_amount,
        count(recipe_ingredient.recipe_id) - count(fridge_ingredient.ingredient_id) AS missing_count
      FROM
        recipe
      LEFT JOIN recipe_ingredient ON recipe_ingredient.recipe_id = recipe.id
      LEFT JOIN fridge_ingredient ON fridge_ingredient.ingredient_id = recipe_ingredient.ingredient_id AND fridge_ingredient.fridge_id = :fridgeId
      JOIN ingredient ON ingredient.id = recipe_ingredient.ingredient_id AND NOT ingredient.assumeUnlimited
      WHERE recipe.meal_type_id = (SELECT id FROM meal_type WHERE name = :mealType) OR :mealType IS NULL
      GROUP BY recipe.id
      -- COUNT excludes NULLs. Less than used to optionally allow missing ingredients
      HAVING missing_count <= :maxMissingIngredients
    `)
    const result = statement.all({ fridgeId, mealType, maxMissingIngredients })

    return result
      .filter(row => !checkAmount || this.getInsufficientAmountCount(row) + row.missing_count <= maxMissingIngredients)
      .map(row => ({
        id: row.id,
        name: row.name,
        missingIngredientAmount: row.missing_count
      }))
  }

  public getBarcode (code: types.RowId): Barcode {
    type Result = types.BarcodeRow & types.IngredientRow
    const statement = this._connection.prepare<Result>(`
      SELECT * FROM barcode
        JOIN ingredient ON ingredient.id = barcode.ingredient_id
        WHERE barcode.code = :code
    `)
    const result = statement.get({ code })

    if (result === undefined) {
      throw new InvalidIdError('barcode', code)
    }

    return {
      code: result.code,
      ingredient: ingredientFromRow(result),
      productName: result.product_name,
      amount: result.amount
    }
  }

  public getFridge (id: types.RowId): Fridge {
    const statement = this._connection.prepare<types.FridgeRow>(`
      SELECT * FROM fridge WHERE id = :id
    `)
    const result = statement.get({ id })

    if (result === undefined) {
      throw new InvalidIdError('fridge', id)
    }

    return {
      id: result.id,
      name: result.name,
      ownerId: result.owner_id
    }
  }
}
