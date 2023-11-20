import type CiMap from '@glossa-glo/case-insensitive-map'

import type IIngredient from '../IIngredient'
import type IRecipe from '../IRecipe'
import { type IRecipeNoId } from '../IRecipe'
import { type IngredientId } from '../IIngredient'

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
  addIngredient: (ingredient: IIngredient) => void

  addRecipe: (recipe: IRecipeNoId) => void

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

  getIngredient: (id: IngredientId) => IIngredient

  /**
   * @param name The name to search for
   * @returns The ingredient, or null if it is not found. May return
   * an equipotent ingredient if an exact match is not found.
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
  getAvailableRecipes: (fridgeId: types.RowId) => types.RowId[]
}
