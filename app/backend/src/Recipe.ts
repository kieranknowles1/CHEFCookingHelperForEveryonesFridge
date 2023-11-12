import { parseCsvRow, type IngredientMap } from './Ingredient'
import type ICsvRecipeRow from './ICsvRecipeRow'

export default class Recipe {
  public static fromCsvRow (row: ICsvRecipeRow): Recipe {
    return new Recipe(row)
  }

  private constructor (row: ICsvRecipeRow) {
    this.name = row.title
    const directionsArray = JSON.parse(row.directions) as string[]
    this.directions = directionsArray.join('\n')
    this.link = row.link

    // TODO: Get the amounts
    this.ingredients = parseCsvRow(row)
  }

  name: string
  directions: string
  link: string

  ingredients: IngredientMap
}
