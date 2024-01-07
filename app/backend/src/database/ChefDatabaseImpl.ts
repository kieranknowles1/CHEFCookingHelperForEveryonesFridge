/* eslint-disable @typescript-eslint/consistent-type-assertions */
import path from 'path'
import { readFileSync } from 'fs'

import type Barcode from '../types/Barcode'
import type EmbeddedSentence from '../ml/EmbeddedSentence'
import logger from '../logger'
import ml_extendDatabase from '../ml/extendDatabase'

import type * as types from './types'
import {
  type IFridgeDatabase,
  type IIngredientDatabase,
  type IRecipeDatabase,
  type IUserDatabase,
  type IWritableDatabase
} from './IChefDatabase'
import FridgeDatabaseImpl from './FridgeDatabaseImpl'
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

export default class ChefDatabaseImpl implements IChefDatabase {
  private readonly _connection: IConnection

  public readonly fridges: IFridgeDatabase
  public readonly ingredients: IIngredientDatabase
  public readonly recipes: IRecipeDatabase
  public readonly users: IUserDatabase

  public constructor (connection: IConnection) {
    this._connection = connection
    this.fridges = new FridgeDatabaseImpl(connection)
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
      writable.invalidate()
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
}
