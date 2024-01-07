import type Ingredient from '../types/Ingredient'

import { type IngredientRow } from './types'

/**
 * Helper function to convert a row from the database into an Ingredient object.
 */
export default function ingredientFromRow (row: IngredientRow): Ingredient {
  return {
    id: row.id,
    name: row.name,
    preferredUnit: row.preferredUnit,
    density: row.density ?? undefined,
    assumeUnlimited: row.assumeUnlimited !== 0
  }
}
