import path from 'path'
import { readFileSync } from 'fs'

import Database from 'better-sqlite3'

import { type IAvailableRecipe, type IRecipeNoId, type ISimilarRecipe } from '../types/IRecipe'
import { type IngredientId, ingredientMapFactory } from '../types/IIngredient'
import CaseInsensitiveMap from '../types/CaseInsensitiveMap'
import type IBarcode from '../types/IBarcode'
import type IEmbeddedSentence from '../ml/IEmbeddedSentence'
import type IIngredient from '../types/IIngredient'
import type IRecipe from '../types/IRecipe'
import logger from '../logger'
import ml_extendDatabase from '../ml/extendDatabase'

import type * as types from './types'
import { type IFridgeIngredientAmount, type IWritableDatabase } from './IChefDatabase'
import { bufferFromFloat32Array, bufferToFloat32Array } from './bufferFloat32Array'
import type IChefDatabase from './IChefDatabase'
import InvalidIdError from './InvalidIdError'

const SCHEMA_PATH = path.join(process.cwd(), 'data/schema.sql')
const INITIAL_DATA_PATH = path.join(process.cwd(), 'data/initialdata.sql')
const DUMMY_DATA_PATH = path.join(process.cwd(), 'data/dummydata.sql')

type GetResult<TRow> = TRow | undefined
type AllResult<TRow> = TRow[]

interface IIntegrityCheckRow {
  integrity_check: string
}

interface IForeignKeyCheckRow {
  table: string
  rowid: types.RowId
  parent: string
  fkid: number
}

interface ISimilarRecipesResultRow {
  id: types.RowId
  name: string
  similarity: number
}

interface IAvailableRecipesResultRow {
  id: types.RowId
  name: string
  // JSON array -> number[]
  recipe_amount: string
  // JSON array -> number[]
  fridge_amount: string
  missing_count: number
}

/**
 * Writable interface to the database, passed to the callback of {@link ChefDatabaseImpl.wrapTransaction}
 * and is only valid for the duration of the callback.
 */
class WritableDatabaseImpl implements IWritableDatabase {
  private readonly _db: ChefDatabaseImpl
  private readonly _connection: Database.Database

  /** Whether the WritableDatabase is usable. Only true for the duration of {@link ChefDatabaseImpl.wrapTransaction} */
  private _valid: boolean = true
  public close (): void {
    this._valid = false
  }

  private assertValid (): void {
    if (!this._valid) {
      throw new Error('WritableDatabase has been closed')
    }
  }

  public constructor (db: ChefDatabaseImpl, connection: Database.Database) {
    this._db = db
    this._connection = connection
  }

  public addIngredient (ingredient: IIngredient): void {
    this.assertValid()
    // TODO: Reuse prepared statements
    // TODO: statement pack for writable to only prepare them once
    this._connection.prepare<string>(`
      INSERT INTO ingredient
        (name)
      VALUES
        (?)
    `)
      .run(ingredient.name)
  }

  public addEmbedding (sentence: IEmbeddedSentence): void {
    this.assertValid()
    const statement = this._connection.prepare<[string, Buffer]>(`
      INSERT INTO embedding
        (sentence, embedding)
      VALUES
        (?, ?)
      ON CONFLICT DO NOTHING
    `)

    statement.run(sentence.sentence, bufferFromFloat32Array(sentence.embedding))
  }

  public addRecipe (recipe: IRecipeNoId): void {
    this.assertValid()
    const statement = this._connection.prepare<[string, string, string, string]>(`
      INSERT INTO recipe
        (name, directions, link, meal_type_id)
      VALUES
        (?, ?, ?, (SELECT id FROM meal_type WHERE name = ?))
    `)

    // Add the embedding if it doesn't exist. Only do this once per sentence
    if (this._db.getEmbedding(recipe.name.sentence) === null) {
      this.addEmbedding(recipe.name)
    }

    const id = statement.run(recipe.name.sentence, recipe.directions, recipe.link, recipe.mealType.sentence).lastInsertRowid
    if (typeof id === 'bigint') {
      throw new Error('Got bigint for lastInsertRowid')
    }

    const ingredientStatement = this._connection.prepare<[types.RowId, types.RowId, number | null, string]>(`
      INSERT INTO recipe_ingredient
        (recipe_id, ingredient_id, amount, original_line)
      VALUES
        (?, ?, ?, ?)
    `)
    for (const [ingredientId, amount] of recipe.ingredients) {
      ingredientStatement.run(id, ingredientId, amount.amount, amount.originalLine)
    }
  }

  public setIngredientAmount (fridgeId: types.RowId, ingredientId: types.RowId, amount: number): void {
    if (amount === 0) {
      const statement = this._connection.prepare<[types.RowId, types.RowId]>(`
        DELETE FROM fridge_ingredient WHERE fridge_id = ? AND ingredient_id = ?
      `)
      statement.run(fridgeId, ingredientId)
    } else {
      const statement = this._connection.prepare<[types.RowId, types.RowId, types.RowId]>(`
        INSERT OR REPLACE INTO fridge_ingredient
          (fridge_id, ingredient_id, amount)
        VALUES
          (?, ?, ?)
      `)
      statement.run(fridgeId, ingredientId, amount)
    }
  }
}

export default class ChefDatabaseImpl implements IChefDatabase {
  private readonly _connection: Database.Database

  public constructor (path: string) {
    logger.info(`Using database file '${path}'`)
    this._connection = new Database(path)

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
    logger.info('Running dummy data script')
    const dummyData = readFileSync(DUMMY_DATA_PATH, 'utf-8')
    this._connection.exec(dummyData)
  }

  public checkIntegrity (): void {
    const start = Date.now()
    logger.info('Checking database integrity')

    // Expecting this to return exactly one row with the value 'ok'
    const integrityCheck = this._connection.pragma('integrity_check') as AllResult<IIntegrityCheckRow>
    if (integrityCheck.length !== 1 || integrityCheck[0].integrity_check !== 'ok') {
      throw new Error(`Integrity check failed: ${JSON.stringify(integrityCheck)}`)
    }

    // Expecting this to not return anything
    const foreignKeyCheck = this._connection.pragma('foreign_key_check') as AllResult<IForeignKeyCheckRow>
    if (foreignKeyCheck.length > 0) {
      throw new Error(`Foreign key check failed: ${JSON.stringify(foreignKeyCheck)}`)
    }
    const end = Date.now()

    logger.info(`Database integrity check passed in ${end - start}ms`)
  }

  /**
   * Wrap `callback` within a transaction. Must be used for any operations that write to the database
   * The transaction will be rolled back if an uncaught exception occurs and the exception re-thrown
   */
  public wrapTransaction<TReturn = void> (callback: (db: WritableDatabaseImpl) => TReturn): TReturn {
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
  public async wrapTransactionAsync<TReturn = void> (callback: (db: WritableDatabaseImpl) => Promise<TReturn>): Promise<TReturn> {
    return await new Promise<TReturn>((resolve, reject) => {
      const writable = new WritableDatabaseImpl(this, this._connection)
      this._connection.exec('BEGIN TRANSACTION')
      callback(writable).then(data => {
        this._connection.exec('COMMIT')
        resolve(data)
      }).catch((ex) => {
        this._connection.exec('ROLLBACK')
        reject(ex)
      }).finally(() => {
        writable.close()
      })
    })
  }

  public getEmbedding (sentence: string): IEmbeddedSentence | null {
    const statement = this._connection.prepare<[string]>(`
      SELECT embedding FROM embedding WHERE sentence = ?
    `)
    const result = statement.get(sentence) as GetResult<{ embedding: Buffer }>

    if (result === undefined) {
      return null
    }

    return {
      embedding: bufferToFloat32Array(result.embedding),
      sentence
    }
  }

  private ingredientFromRow (row: types.IIngredientRow): IIngredient {
    return {
      id: row.id,
      name: row.name,
      preferredUnit: row.preferredUnit,
      density: row.density ?? undefined,
      assumeUnlimited: row.assumeUnlimited !== 0
    }
  }

  public getIngredient (id: IngredientId): IIngredient {
    const statement = this._connection.prepare<[types.RowId]>(`
      SELECT * FROM ingredient WHERE id = ?
    `)
    const result = statement.get(id) as GetResult<types.IIngredientRow>

    if (result === undefined) {
      throw new InvalidIdError('ingredient', id)
    }

    return this.ingredientFromRow(result)
  }

  public getAllIngredients (): Map<types.RowId, IIngredient> {
    const statement = this._connection.prepare(`
      SELECT * FROM ingredient
    `)
    const result = statement.all() as AllResult<types.IIngredientRow>

    return new Map(result.map(row => [
      row.id,
      this.ingredientFromRow(row)
    ]))
  }

  /**
   * @param name The name to search for
   * @returns The ingredient, or null if it is not found. May return
   * an equipotent ingredient if an exact match is not found.
   */
  public findIngredientByName (name: string): IIngredient | null {
    const statement = this._connection.prepare<string>(`
      SELECT ingredient.*
        FROM view_ingredient_by_name
        JOIN ingredient ON view_ingredient_by_name.id = ingredient.id
        WHERE view_ingredient_by_name.name = ? COLLATE NOCASE
    `)
    const result = statement.get(name) as GetResult<types.IIngredientRow>
    if (result === undefined) {
      return null
    }

    return this.ingredientFromRow(result)
  }

  getMealTypeNames (): string[] {
    const statement = this._connection.prepare(`
      SELECT name FROM meal_type
    `)
    const result = statement.all() as AllResult<{ name: string }>

    return result.map(row => row.name)
  }

  getMealTypes (): IEmbeddedSentence[] {
    const statement = this._connection.prepare(`
      SELECT
        name, embedding
      FROM meal_type
        JOIN embedding ON meal_type.name = embedding.sentence
    `)
    const result = statement.all() as AllResult<{ name: string, embedding: Buffer }>

    return result.map(row => ({
      sentence: row.name,
      embedding: bufferToFloat32Array(row.embedding)
    }))
  }

  /**
   * Get a map of ingredient names to IDs, including any alternate names
   */
  public getAllIngredientsByName (): CaseInsensitiveMap<IIngredient> {
    const statement = this._connection.prepare(`
      SELECT * FROM view_ingredient_by_name
    `)
    const result = statement.all() as AllResult<types.IIngredientRow>
    const map = new CaseInsensitiveMap<IIngredient>()
    for (const pair of result) {
      map.set(pair.name, this.ingredientFromRow(pair))
    }

    return map
  }

  /**
   * Get a recipe by its ID
   */
  public getRecipe (id: types.RowId): IRecipe {
    type Result = types.IRecipeRow & types.IRecipeIngredientRow & { mt_name: string, mt_embedding: Buffer, r_name_embedding: Buffer }
    const statement = this._connection.prepare<[types.RowId]>(`
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
      WHERE recipe.id = ?
    `)

    const result = statement.all(id) as AllResult<Result>
    if (result.length === 0) { throw new InvalidIdError('recipe', id) }

    const ingredients = ingredientMapFactory()
    for (const row of result) {
      ingredients.set(row.ingredient_id, {
        amount: row.amount,
        originalLine: row.original_line
      })
    }

    return {
      id: result[0].id,
      name: { sentence: result[0].name, embedding: bufferToFloat32Array(result[0].r_name_embedding) },
      directions: result[0].directions,
      ingredients,
      link: result[0].link,
      mealType: { sentence: result[0].mt_name, embedding: bufferToFloat32Array(result[0].mt_embedding) }
    }
  }

  public getSimilarRecipes (embedding: IEmbeddedSentence, minSimilarity: number, limit: number): ISimilarRecipe[] {
    const statement = this._connection.prepare<[Buffer, number, number]>(`
      SELECT
        recipe.id,
        recipe.name,
        -- Very expensive, filter as much as possible before this
        ml_similarity(embedding.embedding, ?) AS similarity
      FROM (
        -- Subquery is executed first. Put filtering that
        -- can be done before the similarity check here
        -- Remove duplicate names
        SELECT * FROM recipe
        GROUP BY name COLLATE NOCASE
      ) AS recipe
      JOIN embedding ON recipe.name = embedding.sentence
      WHERE similarity >= ?
      ORDER BY similarity DESC
      LIMIT ?
    `)

    const result = statement.all(bufferFromFloat32Array(embedding.embedding), minSimilarity, limit) as AllResult<ISimilarRecipesResultRow>

    return result
  }

  /**
   * Get the amount of an ingredient in a fridge
   */
  public getIngredientAmount (fridgeId: types.RowId, ingredientId: types.RowId): number {
    const statement = this._connection.prepare<[types.RowId, types.RowId]>(`
      SELECT amount
      FROM fridge_ingredient
      WHERE fridge_id = ? AND ingredient_id = ?
    `)
    const result = statement.get(fridgeId, ingredientId) as GetResult<{ amount: number }>

    return result?.amount ?? 0
  }

  /**
   * Get all ingredient amounts in a fridge
   */
  public getAllIngredientAmounts (fridgeId: types.RowId): Map<types.RowId, IFridgeIngredientAmount> {
    type IAllIngredientAmountsRow = types.IIngredientRow & types.IFridgeIngredientRow
    const statement = this._connection.prepare<[types.RowId]>(`
      SELECT *
      FROM fridge_ingredient
      JOIN ingredient ON ingredient.id = fridge_ingredient.ingredient_id
      WHERE fridge_id = ?
      ORDER BY ingredient.name
    `)
    const result = statement.all(fridgeId) as AllResult<IAllIngredientAmountsRow>

    const map = new Map<types.RowId, IFridgeIngredientAmount>()
    for (const row of result) {
      map.set(row.ingredient_id, {
        amount: row.amount,
        ingredient: this.ingredientFromRow(row)
      })
    }
    return map
  }

  private getInsufficientAmountCount (row: IAvailableRecipesResultRow): number {
    const neededAmounts = JSON.parse(row.recipe_amount) as number[]
    const availableAmounts = JSON.parse(row.fridge_amount) as number[]

    return neededAmounts.filter((needed, index) => availableAmounts[index] < needed).length
  }

  public getAvailableRecipes (fridgeId: types.RowId, checkAmount: boolean, maxMissingIngredients: number): IAvailableRecipe[] {
    // Well this was easier than expected
    // TODO: Optionally allow substitutions
    const statement = this._connection.prepare<[types.RowId, types.RowId]>(`
      SELECT
        recipe.name, recipe.id,
        -- Used to filter by available amount later
        json_group_array(recipe_ingredient.amount) AS recipe_amount,
        json_group_array(fridge_ingredient.amount) AS fridge_amount,
        count(recipe_ingredient.recipe_id) - count(fridge_ingredient.ingredient_id) AS missing_count
      FROM
        recipe
      LEFT JOIN recipe_ingredient ON recipe_ingredient.recipe_id = recipe.id
      LEFT JOIN fridge_ingredient ON fridge_ingredient.ingredient_id = recipe_ingredient.ingredient_id AND fridge_ingredient.fridge_id = ?
      JOIN ingredient ON ingredient.id = recipe_ingredient.ingredient_id AND NOT ingredient.assumeUnlimited
      GROUP BY recipe.id
      -- COUNT excludes NULLs. Less than used to optionally allow missing ingredients
      HAVING missing_count <= ?
    `)
    const result = statement.all(fridgeId, maxMissingIngredients) as AllResult<IAvailableRecipesResultRow>

    return result
      .filter(row => !checkAmount || this.getInsufficientAmountCount(row) + row.missing_count <= maxMissingIngredients)
      .map(row => ({
        id: row.id,
        name: row.name,
        missingIngredientAmount: row.missing_count
      }))
  }

  public getBarcode (code: types.RowId): IBarcode {
    const statement = this._connection.prepare<[types.RowId]>(`
      SELECT * FROM barcode
        JOIN ingredient ON ingredient.id = barcode.ingredient_id
        WHERE barcode.code = ?
    `)
    const result = statement.get(code) as GetResult<types.IBarcodeRow & types.IIngredientRow>

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
}
