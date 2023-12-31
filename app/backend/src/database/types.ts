import { type DatabaseUnit } from '../types/Unit'

// NOTE: This should technically be `number | bigint`, but openapi-typescript generates `number` for `integer`
// Using `number` here saves on casting
export type RowId = number

export interface EmbeddingRow {
  sentence: string
  embedding: Buffer
}

export interface IngredientRow {
  id: RowId
  name: string
  preferredUnit: DatabaseUnit
  density: number | null
  assumeUnlimited: number
}

export interface MealTypeRow {
  id: RowId
  name: string
}

export interface RecipeRow {
  id: RowId
  name: string
  directions: string
  link: string
  meal_type_id: RowId
}

export interface RecipeIngredientRow {
  recipe_id: RowId
  ingredient_id: RowId

  amount: number | null
  original_line: string
}

export interface FridgeIngredientRow {
  fridge_id: RowId
  ingredient_id: RowId

  amount: number
}

export interface BarcodeRow {
  code: RowId
  ingredient_id: RowId

  product_name: string
  amount: number
}
