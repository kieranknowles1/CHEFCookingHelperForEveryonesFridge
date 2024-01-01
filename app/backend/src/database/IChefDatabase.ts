import { type AvailableRecipe, type RecipeNoId, type SimilarRecipe } from '../types/Recipe'
import { type IngredientId, type IngredientNoId } from '../types/Ingredient'
import type Barcode from '../types/Barcode'
import type CaseInsensitiveMap from '../types/CaseInsensitiveMap'
import type EmbeddedSentence from '../ml/EmbeddedSentence'
import type Ingredient from '../types/Ingredient'
import type Recipe from '../types/Recipe'

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

// TODO: This is a bit of a mess, should be split into multiple interfaces and each implemented in a separate file
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
  getEmbedding: (sentence: string) => EmbeddedSentence | null

  getIngredient: (id: IngredientId) => Ingredient

  getAllIngredients: () => Map<types.RowId, Ingredient>

  /**
   * @param name The name to search for
   * @returns The ingredient, or null if it is not found. May return
   * an equivalent ingredient if an exact match is not found.
   */
  findIngredientByName: (name: string) => Ingredient | null

  getMealTypeNames: () => string[]
  getMealTypes: () => EmbeddedSentence[]

  /**
   * Get a map of ingredient names the ingredient, including any alternate names
   */
  getAllIngredientsByName: () => CaseInsensitiveMap<Ingredient>

  /**
   * Get a recipe by its ID
   */
  getRecipe: (id: types.RowId) => Recipe

  /**
   * Get similar recipes to the given embedding, ordered by similarity
   */
  getSimilarRecipes: (embedding: EmbeddedSentence, minSimilarity: number, limit: number) => SimilarRecipe[]

  /**
   * Get the amount of an ingredient in a fridge
   */
  getIngredientAmount: (fridgeId: types.RowId, ingredientId: types.RowId) => number

  /**
   * Get the amounts of all ingredients in a fridge
   */
  getAllIngredientAmounts: (fridgeId: types.RowId) => Map<types.RowId, FridgeIngredientAmount>

  /**
   * Get the recipes that can be made with the current ingredients in the fridge
   */
  getAvailableRecipes: (fridgeId: types.RowId, checkAmount: boolean, maxMissingIngredients: number) => AvailableRecipe[]

  /**
   * Get the data associated with a barcode, throws if code not found
   */
  getBarcode: (code: types.RowId) => Barcode
}
