import { type IngredientMap } from '../types/IIngredient'

/**
 * A parsed CSV recipe. Only contains data from the CSV file.
 */
export default interface IParsedCsvRecipe {
  name: string
  directions: string
  link: string
  ingredients: IngredientMap
}
