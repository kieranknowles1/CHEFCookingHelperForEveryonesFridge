import { type IRecipeNoId } from '../types/IRecipe'

import getEmbedding from './getEmbedding'

export default async function embedRecipe (recipe: IRecipeNoId): Promise<Float32Array> {
  return await getEmbedding(recipe.name)
}
