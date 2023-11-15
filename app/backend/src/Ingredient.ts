import CiMap from '@glossa-glo/case-insensitive-map'
import type ICsvRecipeRow from './ICsvRecipeRow.js'
import Fraction from 'fraction.js'

import { type DatabaseUnit, tryToMetric, convertToPreferred } from './Unit'
import ChefDatabase from './ChefDatabase'
import logger, { LogLevel } from './logger'

export type IngredientId = number
export type IngredientAmount = number
export type IngredientMap = CiMap<IngredientId, IngredientAmount>

const AMOUNT_PATTERN = /(\d+\/\d+|\d+ \d+\/\d+|\d+) (\w+)/g

export class UnparsedIngredientError extends Error {}

export interface IIngredient {
  name: string
  preferredUnit: DatabaseUnit
  density: number | null
  assumeUnlimited: boolean
}

export default class Ingredient implements IIngredient {
  private static getAmount (ingredient: Ingredient, amounts: string[]): IngredientAmount {
    if (ingredient.preferredUnit === 'none') {
      // TODO: Return null here
      return 0
    }
    function fail (): never { throw new UnparsedIngredientError(`Could not get amount for '${ingredient.name}'`) }
    function amountFromMatch (match: RegExpMatchArray): number { return new Fraction(match[1]).valueOf() }

    const nameLower = ingredient.name.toLowerCase()
    const found = amounts.find(e => e.toLowerCase().includes(nameLower))

    if (found === undefined) { fail() }
    const matches = Array.from(found.matchAll(AMOUNT_PATTERN))

    if (matches.length === 0) { fail() }

    if (ingredient.preferredUnit === 'whole') {
      // Nothing to do
      return amountFromMatch(matches[0])
    } else {
      // Convert to metric
      // Handle cases such as '1 to 2 tsp' by trying every match and using the first one that works
      for (const match of matches) {
        const amount = amountFromMatch(match)
        const unit = match[2]
        const converted = tryToMetric(amount, unit)
        if (converted !== null) {
          return convertToPreferred(converted[0], converted[1], ingredient)
        }
      }
      // No case was handled, throw error
      // This is a higher priority, so also log more detail
      logger.log(LogLevel.warn, `Could not convert '${found}' to metric.`)
      fail()
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
    this.density = raw.density
    this.assumeUnlimited = raw.assumeUnlimited
  }

  id: IngredientId
  name: string
  preferredUnit: DatabaseUnit
  density: number | null
  assumeUnlimited: boolean
}

export function ingredientMapFactory (): IngredientMap {
  return new CiMap<IngredientId, IngredientAmount>()
}
