import { SearchRecipe, type AvailableRecipe, type RecipeNoId, type SimilarRecipe } from '../types/Recipe'
import type Barcode from '../types/Barcode'
import type CaseInsensitiveMap from '../types/CaseInsensitiveMap'
import type EmbeddedSentence from '../ml/EmbeddedSentence'
import type Fridge from '../types/Fridge'
import type Ingredient from '../types/Ingredient'
import { type IngredientNoId } from '../types/Ingredient'
import type Recipe from '../types/Recipe'
import type User from '../types/User'

import type * as types from './types'

export interface FridgeIngredientAmount {
  ingredient: Ingredient
  amount: number
}

/**
 * Writable interface to the database, passed to the callback of {@link IChefDatabase.wrapTransaction}
 * and is only valid for the duration of the callback.
 */
export interface IWritableDatabase {
  addIngredient: (ingredient: IngredientNoId) => types.RowId

  /**
   * Add an embedding for a sentence to the database for future use
   * If the sentence already exists, nothing will be done
   */
  addEmbedding: (sentence: EmbeddedSentence) => void

  addRecipe: (recipe: RecipeNoId) => types.RowId

  setIngredientAmount: (fridgeId: types.RowId, ingredientId: types.RowId, amount: number) => void
}

export interface IFridgeDatabase {
  get: (id: types.RowId) => Fridge

  getIngredientAmount: (fridgeId: types.RowId, ingredientId: types.RowId) => number
  getAllIngredientAmounts: (fridgeId: types.RowId) => Map<types.RowId, FridgeIngredientAmount>

  /**
   * Get the recipes that can be made with the current ingredients in the fridge
   */
  getAvailableRecipes: (fridgeId: types.RowId, checkAmount: boolean, maxMissingIngredients: number, mealType: string | null) => AvailableRecipe[]
}

export interface IIngredientDatabase {
  get: (id: types.RowId) => Ingredient
  getByName: (name: string) => Ingredient | undefined

  getAll: () => Map<types.RowId, Ingredient>
  getAllWithAltNames: () => CaseInsensitiveMap<Ingredient>
}

export interface SearchParams {
  search?: EmbeddedSentence
  minSimilarity?: number

  availableForFridge?: types.RowId
  maxMissingIngredients?: number
  checkAmounts?: boolean

  limit?: number
  mealType?: string
}

export interface IRecipeDatabase {
  get: (id: types.RowId) => Recipe

  search: (params: SearchParams) => SearchRecipe[]

  /**
   * Get the recipes that are similar to the given embedding and of the given meal type
   */
  getSimilar: (embedding: EmbeddedSentence, minSimilarity: number, limit: number, mealType: string) => SimilarRecipe[]
}

export interface IUserDatabase {
  get: (id: types.RowId) => User
}

export default interface IChefDatabase {

  readonly fridges: IFridgeDatabase
  readonly ingredients: IIngredientDatabase
  readonly recipes: IRecipeDatabase
  readonly users: IUserDatabase

  /**
   * Run the schema and initial script. Should only be used during setup
   *
   * WARN: This will delete ALL data from the database.
   */
  resetDatabase: (_: 'IKnowWhatIAmDoing') => void

  /**
   * Check the integrity of the database and all of its tables
   * @throws {Error} If the integrity check fails
   */
  checkIntegrity: () => void

  /**
   * Execute a callback in a transaction. The callback can write to the database using the given
   * {@link IWritableDatabase} instance.
   * - The writable database is only valid for the duration of the callback.
   * - If an exception is thrown, the transaction will be rolled back and the exception re-thrown.
   *
   * @returns The return value of the callback, if any
   */
  wrapTransaction: <TReturn = void>(callback: (db: IWritableDatabase) => TReturn) => TReturn

  /**
   * Get the embedding for a sentence if it exists
   */
  getEmbedding: (sentence: string) => EmbeddedSentence | null

  getMealTypeNames: () => string[]
  getMealTypes: () => EmbeddedSentence[]

  /**
   * Get the data associated with a barcode, throws if code not found
   */
  getBarcode: (code: types.RowId) => Barcode
}
