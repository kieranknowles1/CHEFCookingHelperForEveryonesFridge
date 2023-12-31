import { type IngredientMap } from '../types/Ingredient'

/**
 * A parsed CSV recipe. Only contains data from the CSV file.
 */
export default interface ParsedCsvRecipe {
  name: string
  directions: string
  link: string
  ingredients: IngredientMap
}
