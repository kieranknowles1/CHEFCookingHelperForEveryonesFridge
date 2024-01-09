import { type IngredientAmount, type IngredientId } from '../types/Ingredient'
import type EmbeddedSentence from '../ml/EmbeddedSentence'
import type Recipe from '../types/Recipe'
import { type SimilarRecipe } from '../types/Recipe'

import type * as types from './types'
import { bufferFromFloat32Array, bufferToFloat32Array } from './bufferFloat32Array'
import type IConnection from './IConnection'
import { type IRecipeDatabase } from './IChefDatabase'
import InvalidIdError from './InvalidIdError'

export default class RecipeDatabaseImpl implements IRecipeDatabase {
  private readonly _connection: IConnection

  public constructor (connection: IConnection) {
    this._connection = connection
  }

  public get (id: types.RowId): Recipe {
    type Result = types.RecipeRow & types.RecipeIngredientRow & { mt_name: string, mt_embedding: Buffer, r_name_embedding: Buffer }
    const statement = this._connection.prepare<Result>(`
      SELECT
        recipe.*,
        recipe_ingredient.*,
        r_embedding.embedding AS r_name_embedding,
        meal_type.name AS mt_name,
        mt_embedding.embedding AS mt_embedding
      FROM recipe
        JOIN recipe_ingredient ON recipe_ingredient.recipe_id = recipe.id
        JOIN embedding AS r_embedding ON recipe.name = r_embedding.sentence
        JOIN meal_type ON meal_type.id = recipe.meal_type_id
        JOIN embedding AS mt_embedding ON meal_type.name = mt_embedding.sentence
      WHERE recipe.id = :id
    `)

    const result = statement.all({ id })
    if (result.length === 0) { throw new InvalidIdError('recipe', id) }

    const ingredients = new Map<IngredientId, IngredientAmount>(result.map(row => [
      row.ingredient_id,
      { amount: row.amount, originalLine: row.original_line }
    ]))

    return {
      id: result[0].id,
      name: { sentence: result[0].name, embedding: bufferToFloat32Array(result[0].r_name_embedding) },
      directions: result[0].directions,
      ingredients,
      link: result[0].link,
      mealType: { sentence: result[0].mt_name, embedding: bufferToFloat32Array(result[0].mt_embedding) }
    }
  }

  public getSimilar (
    embedding: EmbeddedSentence,
    minSimilarity: number,
    limit: number,
    mealType: string
  ): SimilarRecipe[] {
    interface SimilarRecipesResultRow {
      id: types.RowId
      name: string
      similarity: number
    }
    const statement = this._connection.prepare<SimilarRecipesResultRow>(`
      SELECT
        recipe.id,
        recipe.name,
        ml_similarity(embedding.embedding, :embedding) AS similarity
      FROM (
        -- Using a subquery here to force its execution before ml_similarity
        -- This is because ml_similarity is expensive and we want to filter
        -- as much as possible before executing it
        SELECT * FROM recipe
        WHERE meal_type_id = (SELECT id FROM meal_type WHERE name = :mealType)
        -- EXPLAIN QUERY PLAN mentioned that this uses a temp b-tree, tests showed that it's faster
        -- than using HAVING to filter meal type
        GROUP BY name COLLATE NOCASE
      ) AS recipe
      JOIN embedding ON recipe.name = embedding.sentence
      WHERE similarity >= :minSimilarity
      ORDER BY similarity DESC
      LIMIT :limit
    `)

    return statement.all({
      embedding: bufferFromFloat32Array(embedding.embedding),
      mealType,
      minSimilarity,
      limit
    })
  }
}
