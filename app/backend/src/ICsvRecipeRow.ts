import type { IRecipeNoId } from './IRecipe'
import parseIngredients from './parseIngredients'

/**
 * An unparsed row as it appears in full_dataset.csv
 * NOTE: Arrays are represented as strings here
 */
export default interface ICsvRecipeRow {
  title: string
  /** JSON array of ingredient names and amounts */
  ingredients: string
  /** JSON array of steps */
  directions: string
  link: string
  /** The dataset the recipe was sourced from */
  source: string
  /** JSON array of ingredient names */
  NER: string
}

export function parseCsvRecipeRow (row: ICsvRecipeRow): IRecipeNoId {
  const directionsArray = JSON.parse(row.directions) as string[]
  const directions = directionsArray.join('\n')
  const ingredients = parseIngredients(row)
  return {
    name: row.title,
    directions,
    link: row.link,
    ingredients
  }
}
