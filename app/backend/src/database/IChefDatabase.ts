import { type RecipeNoId, type SearchRecipe } from '../types/Recipe'
import type Barcode from '../types/Barcode'
import type CaseInsensitiveMap from '../types/CaseInsensitiveMap'
import type EmbeddedSentence from '../ml/EmbeddedSentence'
import type Fridge from '../types/Fridge'
import type Ingredient from '../types/Ingredient'
import { type IngredientNoId } from '../types/Ingredient'
import type Recipe from '../types/Recipe'
import type Tag from '../types/Tag'
import type User from '../types/User'
import { type UserCredentials } from '../types/User'

import type * as types from './types'

export interface FridgeIngredientAmount {
  ingredient: Ingredient
  amount: number
}

export interface MadeRecipeItem {
  id: types.RowId
  recipe: {
    id: types.RowId
    name: string
  }
  fridge: {
    id: types.RowId
    name: string
  }
  users: Array<{
    id: types.RowId
    name: string
  }>
  dateMade: Date
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

  addMadeRecipe: (params: {
    recipeId: types.RowId
    fridgeId: types.RowId
    dateMade: Date
    users: types.RowId[]
  }) => void

  // Add or update a barcode in the database.
  // NOTE: There is no ID returned, as the barcode itself is the ID
  setBarcode: (code: types.RowId, params: {
    ingredientId: types.RowId
    amount: number
    productName: string
  }) => void

  setTagPreference: (userId: types.RowId, tagId: types.RowId, allow: boolean) => void
  setIngredientPreference: (userId: types.RowId, ingredientId: types.RowId, allow: boolean) => void
}

export interface IFridgeDatabase {
  get: (id: types.RowId) => Fridge

  getIngredientAmount: (fridgeId: types.RowId, ingredientId: types.RowId) => number
  getAllIngredientAmounts: (fridgeId: types.RowId) => Map<types.RowId, FridgeIngredientAmount>
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

  bannedIngredients?: types.RowId[]
  bannedTags?: types.RowId[]
}

export interface IRecipeDatabase {
  get: (id: types.RowId) => Recipe

  search: (params: SearchParams) => SearchRecipe[]
}

export interface GetHistoryParams {
  userId: types.RowId
  limit: number
  // If provided, only return items for this recipe
  recipeId?: types.RowId
}

export interface AvailableFridge {
  id: types.RowId
  name: string
  owner: {
    id: types.RowId
    name: string
  }
}

export interface IUserDatabase {
  get: (id: types.RowId) => User

  /**
   * Get all fridges that the user has access to, along with the names and IDs of their owners
   */
  getAvailableFridges: (userId: types.RowId) => AvailableFridge[]

  /**
   * Get the history of recipes made by a user, sorted by date made most recent first
   */
  getHistory: (params: GetHistoryParams) => MadeRecipeItem[]

  /**
   * Get the user with the given name and return their credentials.
   * Case insensitive.
   */
  getCredentials: (username: string) => UserCredentials | null
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

  getTags: () => Tag[]

  /**
   * Get the data associated with a barcode, throws if code not found
   */
  getBarcode: (code: types.RowId) => Barcode
}
