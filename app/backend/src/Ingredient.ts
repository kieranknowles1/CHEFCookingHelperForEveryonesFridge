import CiMap from '@glossa-glo/case-insensitive-map'
import type ICsvRecipeRow from './ICsvRecipeRow.js'
import Fraction from 'fraction.js'

import ChefDatabase from './ChefDatabase'
import { type Unit } from 'Unit.js'

export type IngredientId = number
// TODO: This should include the units and convert them to metric
export type IngredientAmount = number
export type IngredientMap = CiMap<IngredientId, IngredientAmount>

const AMOUNT_PATTERN = /(\d+\/\d+|\d+ \d+\/\d+|\d+)/

export class UnparsedIngredientError extends Error {}

export interface IIngredient {
  name: string
  preferredUnit: Unit
}

export default class Ingredient implements IIngredient {
  private static getAmount (name: string, amounts: string[]): IngredientAmount {
    function fail (): never { throw new UnparsedIngredientError(`Could not get amount for '${name}'`) }

    const nameLower = name.toLowerCase()
    const found = amounts.find(e => e.toLowerCase().includes(nameLower))

    if (found === undefined) { fail() }

    const match = found.match(AMOUNT_PATTERN)?.[1]
    if (match === undefined) { fail() }

    return new Fraction(match).valueOf()
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
      map.set(ingredient.id, this.getAmount(name, amounts))
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
