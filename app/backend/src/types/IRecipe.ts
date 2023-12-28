import type IEmbeddedSentence from '../ml/IEmbeddedSentence'
import { type RowId } from '../database/types'

import { type IngredientMap } from './IIngredient'

export interface IAvailableRecipe {
  id: RowId
  name: string
  missingIngredientAmount: number
}

export interface ISimilarRecipe {
  id: RowId
  name: string
  similarity: number
}

export interface IRecipeNoId {
  name: IEmbeddedSentence
  directions: string
  link: string
  ingredients: IngredientMap
}

export default interface IRecipe extends IRecipeNoId {
  id: RowId
}
