import CiMap from '@glossa-glo/case-insensitive-map'
import type ICsvRecipeRow from './ICsvRecipeRow.js'
// NOTE: TypeScript is being awkward here and won't let me import the usual way
//const Fraction = import('fraction.js')
import Fraction from 'fraction.js'

export type IngredientId = string
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

  //const frac = Fraction.

  console.log(match)
  return 0
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
