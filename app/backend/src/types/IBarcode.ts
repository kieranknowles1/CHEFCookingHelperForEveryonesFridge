import type IIngredient from './IIngredient'

export default interface IBarcode {
  code: number
  ingredient: IIngredient

  productName: string
  amount: number
}
