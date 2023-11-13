import CiMap from '@glossa-glo/case-insensitive-map'
import type ICsvRecipeRow from './ICsvRecipeRow.js'
import Fraction from 'fraction.js'

import ChefDatabase from './ChefDatabase'
import { Unit } from './Unit'

export type IngredientId = number
export type IngredientAmount = number
export type IngredientMap = CiMap<IngredientId, IngredientAmount>

const AMOUNT_PATTERN = /(\d+\/\d+|\d+ \d+\/\d+|\d+) (\w+)/

export class UnparsedIngredientError extends Error {}

export interface IIngredient {
  name: string
  preferredUnit: Unit
}

export default class Ingredient implements IIngredient {
  private static getAmount (ingredient: Ingredient, amounts: string[]): IngredientAmount {
    function fail (): never { throw new UnparsedIngredientError(`Could not get amount for '${ingredient.name}'`) }

    const nameLower = ingredient.name.toLowerCase()
    const found = amounts.find(e => e.toLowerCase().includes(nameLower))

    if (found === undefined) { fail() }

    const match = found.match(AMOUNT_PATTERN)
    if (match === null) { fail() }

    const amount = new Fraction(match[1]).valueOf()
    const unit = match[2]

    if (ingredient.preferredUnit === Unit.whole) {
      // Nothing to do
      return amount
    } else if (ingredient.preferredUnit === Unit.none) {
      // TODO: Return null here
      return amount
    } else {
      // TODO: Convert to metric
      return amount
    }
  }

  static parseCsvRow (row: ICsvRecipeRow): IngredientMap {
    const map = ingredientMapFactory()

    // NER contains names, ingredients contains names and amounts
    const names = JSON.parse(row.NER) as string[]
    const amounts = JSON.parse(row.ingredients) as string[]

    for (const name of names) {
      const ingredient = ChefDatabase.Instance.findIngredientByName(name)
      if (ingredient === null) {
        throw new Error(`Ingredient ${name} does not exist in database`)
      }
      map.set(ingredient.id, this.getAmount(ingredient, amounts))
    }

    return map
  }

  constructor (raw: IIngredient, id: IngredientId) {
    this.id = id
    this.name = raw.name
    this.preferredUnit = raw.preferredUnit
  }

  id: IngredientId
  name: string
  preferredUnit: Unit
}

export function ingredientMapFactory (): IngredientMap {
  return new CiMap<IngredientId, IngredientAmount>()
}
