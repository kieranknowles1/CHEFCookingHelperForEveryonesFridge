/* eslint-disable @typescript-eslint/consistent-type-assertions */
import path from 'path'
import { readFileSync } from 'fs'

import { type AvailableRecipe, type SimilarRecipe } from '../types/Recipe'
import { type IngredientAmount, type IngredientId } from '../types/Ingredient'
import type Barcode from '../types/Barcode'
import CaseInsensitiveMap from '../types/CaseInsensitiveMap'
import type EmbeddedSentence from '../ml/EmbeddedSentence'
import type Fridge from '../types/Fridge'
import type Ingredient from '../types/Ingredient'
import type Recipe from '../types/Recipe'
import logger from '../logger'
import ml_extendDatabase from '../ml/extendDatabase'

import type * as types from './types'
import { type FridgeIngredientAmount, type IUserDatabase, type IWritableDatabase } from './IChefDatabase'
import { bufferFromFloat32Array, bufferToFloat32Array } from './bufferFloat32Array'
import type IChefDatabase from './IChefDatabase'
import type IConnection from './IConnection'
import InvalidIdError from './InvalidIdError'
import UserDatabaseImpl from './UserDatabaseImpl'
import WritableDatabaseImpl from './WritableDatabaseImpl'

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

  public readonly users: IUserDatabase

  public constructor (connection: IConnection) {
    this._connection = connection
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

  /**
   * Async version of {@link wrapTransaction} that waits for the promise to be
   * settled before committing/rolling back
   * @returns The return value of `callback` or void if none
   */
  public async wrapTransactionAsync<TReturn = void> (callback: (db: IWritableDatabase) => Promise<TReturn>): Promise<TReturn> {
    return await new Promise<TReturn>((resolve, reject) => {
      const writable = new WritableDatabaseImpl(this, this._connection)
      this._connection.exec('BEGIN TRANSACTION')
      callback(writable).then(data => {
        this._connection.exec('COMMIT')
        writable.close()
        resolve(data)
      }).catch((ex) => {
        this._connection.exec('ROLLBACK')
        writable.close()
        reject(ex)
      })
    })
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

  private ingredientFromRow (row: types.IngredientRow): Ingredient {
    return {
      id: row.id,
      name: row.name,
      preferredUnit: row.preferredUnit,
      density: row.density ?? undefined,
      assumeUnlimited: row.assumeUnlimited !== 0
    }
  }

  public getIngredient (id: IngredientId): Ingredient {
    const statement = this._connection.prepare<types.IngredientRow>(`
      SELECT * FROM ingredient WHERE id = :id
    `)
    const result = statement.get({ id })

    if (result === undefined) {
      throw new InvalidIdError('ingredient', id)
    }

    return this.ingredientFromRow(result)
  }

  public getAllIngredients (): Map<types.RowId, Ingredient> {
    const statement = this._connection.prepare<types.IngredientRow>(`
      SELECT * FROM ingredient
    `)
    const result = statement.all()

    return new Map(result.map(row => [
      row.id,
      this.ingredientFromRow(row)
    ]))
  }

  /**
   * @param name The name to search for
   * @returns The ingredient, or null if it is not found. May return
   * an equivalent ingredient if an exact match is not found.
   */
  public findIngredientByName (name: string): Ingredient | null {
    const statement = this._connection.prepare<types.IngredientRow>(`
      SELECT ingredient.*
        FROM view_ingredient_by_name
        JOIN ingredient ON view_ingredient_by_name.id = ingredient.id
        WHERE view_ingredient_by_name.name = :name COLLATE NOCASE
    `)
    const result = statement.get({ name })
    if (result === undefined) {
      return null
    }

    return this.ingredientFromRow(result)
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
   * Get a map of ingredient names to IDs, including any alternate names
   */
  public getAllIngredientsByName (): CaseInsensitiveMap<Ingredient> {
    type Result = types.IngredientRow & { alt_name: string }
    const statement = this._connection.prepare<Result>(`
      SELECT
        view_ingredient_by_name.name AS alt_name,
        ingredient.*
      FROM view_ingredient_by_name
        JOIN ingredient ON ingredient.id = view_ingredient_by_name.id
    `)
    const result = statement.all()
    const map = new CaseInsensitiveMap<Ingredient>()
    for (const pair of result) {
      map.set(pair.alt_name, this.ingredientFromRow(pair))
    }

    return map
  }

  /**
   * Get a recipe by its ID
   */
  public getRecipe (id: types.RowId): Recipe {
    type Result = types.RecipeRow & types.RecipeIngredientRow & { mt_name: string, mt_embedding: Buffer, r_name_embedding: Buffer }
    const statement = this._connection.prepare<Result>(`
      SELECT
        recipe.*,
        recipe_ingredient.*,
        r_embedding.embedding AS r_name_embedding,
        meal_type.name AS mt_name,
        mt_embedding.embedding AS mt_embedding
      FROM recipe
        JOIN recipe_ingredient ON recipe_ingredient.recipe_id = recipe.id
        JOIN embedding AS r_embedding ON recipe.name = r_embedding.sentence
        JOIN meal_type ON meal_type.id = recipe.meal_type_id
        JOIN embedding AS mt_embedding ON meal_type.name = mt_embedding.sentence
      WHERE recipe.id = :id
    `)

    const result = statement.all({ id })
    if (result.length === 0) { throw new InvalidIdError('recipe', id) }

    const ingredients = new Map<IngredientId, IngredientAmount>(result.map(row => [
      row.ingredient_id,
      { amount: row.amount, originalLine: row.original_line }
    ]))

    return {
      id: result[0].id,
      name: { sentence: result[0].name, embedding: bufferToFloat32Array(result[0].r_name_embedding) },
      directions: result[0].directions,
      ingredients,
      link: result[0].link,
      mealType: { sentence: result[0].mt_name, embedding: bufferToFloat32Array(result[0].mt_embedding) }
    }
  }

  public getSimilarRecipes (embedding: EmbeddedSentence, minSimilarity: number, limit: number, mealType: string): SimilarRecipe[] {
    interface SimilarRecipesResultRow {
      id: types.RowId
      name: string
      similarity: number
    }
    const statement = this._connection.prepare<SimilarRecipesResultRow>(`
      SELECT
        recipe.id,
        recipe.name,
        -- Very expensive, filter as much as possible before this
        ml_similarity(embedding.embedding, :embedding) AS similarity
      FROM (
        -- Subquery is executed first. Put filtering that
        -- can be done before the similarity check here
        -- Remove duplicate names
        SELECT * FROM recipe
        WHERE meal_type_id = (SELECT id FROM meal_type WHERE name = :mealType)
        GROUP BY name COLLATE NOCASE
      ) AS recipe
      JOIN embedding ON recipe.name = embedding.sentence
      WHERE similarity >= :minSimilarity
      ORDER BY similarity DESC
      LIMIT :limit
    `)

    return statement.all({
      embedding: bufferFromFloat32Array(embedding.embedding),
      mealType,
      minSimilarity,
      limit
    })
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
        ingredient: this.ingredientFromRow(row)
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
      ingredient: this.ingredientFromRow(result),
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
