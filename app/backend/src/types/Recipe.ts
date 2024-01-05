import type EmbeddedSentence from '../ml/EmbeddedSentence'
import { type RowId } from '../database/types'

import { type IngredientMap } from './Ingredient'

export interface AvailableRecipe {
  id: RowId
  name: string
  missingIngredientAmount: number
}

export interface SimilarRecipe {
  id: RowId
  name: string
  similarity: number
}

export interface RecipeNoId {
  name: EmbeddedSentence
  directions: string
  link: string
  ingredients: IngredientMap
  mealType: EmbeddedSentence
}

export default interface Recipe extends RecipeNoId {
  id: RowId
}