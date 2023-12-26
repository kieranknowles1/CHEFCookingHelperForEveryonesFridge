import type CiMap from '@glossa-glo/case-insensitive-map'

import { type IAvailableRecipe, type IRecipeNoId, type ISimilarRecipe } from '../types/IRecipe'
import type IBarcode from '../types/IBarcode'
import type IIngredient from '../types/IIngredient'
import type IRecipe from '../types/IRecipe'
import { type IngredientId } from '../types/IIngredient'

import type * as types from './types'

export interface IFridgeIngredientAmount {
  ingredient: IIngredient
  amount: number
}

/**
 * Writable interface to the database, passed to the callback of {@link IChefDatabase.wrapTransaction}
 * and is only valid for the duration of the callback.
 */
export interface IWritableDatabase {
  addMealType: (name: string) => Promise<void>

  addIngredient: (ingredient: IIngredient) => void

  /**
   * Calculate the embedding for a sentence and add it to the database to be referenced later
   */
  addEmbedding: (sentence: string) => void

  addRecipe: (recipe: IRecipeNoId) => Promise<void>

  setIngredientAmount: (fridgeId: types.RowId, ingredientId: types.RowId, amount: number) => void
}

export default interface IChefDatabase {
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
   * Wrap `callback` within a transaction. Must be used for any operations that write to the database
   * The transaction will be rolled back if an uncaught exception occurs and the exception re-thrown
   */
  wrapTransaction: <TReturn = void>(callback: (db: IWritableDatabase) => TReturn) => TReturn

  /**
   * Async version of {@link wrapTransaction} that waits for the promise to be
   * settled before committing/rolling back
   * @returns The return value of `callback` or void if none
   */
  wrapTransactionAsync: <TReturn = void>(callback: (db: IWritableDatabase) => Promise<TReturn>) => Promise<TReturn>

  /**
   * Get the embedding for a sentence if it exists
   */
  getEmbedding: (sentence: string) => Float32Array | null

  getIngredient: (id: IngredientId) => IIngredient

  getAllIngredients: () => Map<types.RowId, IIngredient>

  /**
   * @param name The name to search for
   * @returns The ingredient, or null if it is not found. May return
   * an equivalent ingredient if an exact match is not found.
   */
  findIngredientByName: (name: string) => IIngredient | null

  /**
   * Get a map of ingredient names to IDs, including any alternate names
   */
  getIngredientIds: () => CiMap<string, IngredientId>

  /**
   * Get a recipe by its ID
   */
  getRecipe: (id: types.RowId) => IRecipe

  /**
   * Get similar recipes to the given embedding, ordered by similarity
   */
  getSimilarRecipes: (embedding: Float32Array, minSimilarity: number, limit: number) => ISimilarRecipe[]

  /**
   * Get the amount of an ingredient in a fridge
   */
  getIngredientAmount: (fridgeId: types.RowId, ingredientId: types.RowId) => number

  /**
   * Get the amounts of all ingredients in a fridge
   */
  getAllIngredientAmounts: (fridgeId: types.RowId) => Map<types.RowId, IFridgeIngredientAmount>

  /**
   * Get the recipes that can be made with the current ingredients in the fridge
   */
  getAvailableRecipes: (fridgeId: types.RowId, checkAmount: boolean, maxMissingIngredients: number) => IAvailableRecipe[]

  /**
   * Get the data associated with a barcode, throws if code not found
   */
  getBarcode: (code: types.RowId) => IBarcode
}
