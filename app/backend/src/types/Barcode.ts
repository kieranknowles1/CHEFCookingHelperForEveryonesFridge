import type Ingredient from './Ingredient'

export default interface Barcode {
  code: number
  ingredient: Ingredient

  productName: string
  amount: number
}
