/**
 * An unparsed row as it appears in full_dataset.csv
 * NOTE: Arrays are represented as strings here
 */
export default interface RawCsvRecipe {
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
