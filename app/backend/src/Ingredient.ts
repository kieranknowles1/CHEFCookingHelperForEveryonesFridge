import CiMap from '@glossa-glo/case-insensitive-map'

export type Ingredient = string
export type IngredientMap = CiMap<Ingredient, number>

export function ingredientMapFactory (): IngredientMap {
  return new CiMap<Ingredient, number>()
}
