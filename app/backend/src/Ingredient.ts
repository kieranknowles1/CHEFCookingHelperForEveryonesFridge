import CiMap from '@glossa-glo/case-insensitive-map'
import type ICsvRecipeRow from './ICsvRecipeRow.js'
// NOTE: TypeScript is being awkward here. I need to include `mathjs` in package.json and include `fraction.js` here.
import Fraction from 'fraction.js'

export type IngredientId = string
// TODO: This should include the units
export type IngredientAmount = number
export type IngredientMap = CiMap<IngredientId, IngredientAmount>

const AMOUNT_PATTERN = /(\d+\/\d+|\d+ \d+\/\d+|\d+)/

function getAmount (name: string, amounts: string[]): IngredientAmount {
  function fail (): never { throw new Error(`Could not get amount for '${name}`) }

  const nameLower = name.toLowerCase()
  const found = amounts.find(e => e.toLowerCase().includes(nameLower))

  if (found === undefined) { fail() }

  const match = found.match(AMOUNT_PATTERN)?.[1]
  if (match === undefined) { fail() }

  return new Fraction(match).valueOf()
}

export function parseCsvRow (row: ICsvRecipeRow): IngredientMap {
  const map = new CiMap<IngredientId, IngredientAmount>()

  // NER contains names, ingredients contains names and amounts
  const names = new Set(JSON.parse(row.NER) as string[])
  const amounts = JSON.parse(row.ingredients) as string[]

  names.forEach(name => {
    map.set(name, getAmount(name, amounts))
  })

  return map
}
