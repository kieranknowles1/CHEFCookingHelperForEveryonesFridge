/**
 * An unparsed row as it appears in full_dataset.csv
 * NOTE: Arrays are represented as strings here
 */
export interface ICsvRecipeRow {
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

export default class Recipe {
  public static fromCsvRow (row: ICsvRecipeRow): Recipe {
    return new Recipe(row)
  }

  private constructor (row: ICsvRecipeRow) {
    this.name = row.title
    const directionsArray = JSON.parse(row.directions) as string[]
    this.directions = directionsArray.join('\n')
    this.link = row.link
  }

  name: string
  directions: string
  link: string
}
