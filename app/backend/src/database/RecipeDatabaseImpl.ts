import { type IngredientAmount, type IngredientId } from '../types/Ingredient'
import type Recipe from '../types/Recipe'
import { type SearchRecipe } from '../types/Recipe'

import type * as types from './types'
import { type IRecipeDatabase, type SearchParams } from './IChefDatabase'
import { bufferFromFloat32Array, bufferToFloat32Array } from './bufferFloat32Array'
import type IConnection from './IConnection'
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

  public search (params: SearchParams): SearchRecipe[] {
    interface SearchRecipesResultRow {
      name: string
      id: types.RowId
      missing_count: number
      similarity: number | null
    }

    // Destructure the params so I know i've handled them all
    const {
      search,
      minSimilarity = 0,

      availableForFridge,
      maxMissingIngredients = 0,
      checkAmounts = true,

      limit = Number.MAX_SAFE_INTEGER,
      mealType,

      bannedIngredients = [],
      bannedTags = []
    } = params

    const bannedIngredsTable = this._connection.generateTempTableName()
    const bannedTagsTable = this._connection.generateTempTableName()

    try {
      this._connection.exec(`CREATE TEMP TABLE ${bannedIngredsTable} (ingredient_id INTEGER PRIMARY KEY)`)
      for (const ingredient of bannedIngredients) {
        this._connection.prepare<undefined>(`INSERT INTO ${bannedIngredsTable} (ingredient_id) VALUES (:ingredient)`).run({ ingredient })
      }
      this._connection.exec(`CREATE TEMP TABLE ${bannedTagsTable} (tag_id INTEGER PRIMARY KEY)`)
      for (const tag of bannedTags) {
        this._connection.prepare<undefined>(`INSERT INTO ${bannedTagsTable} (tag_id) VALUES (:tag)`).run({ tag })
      }

      // This query is an unholy monstrosity that should burn for its sins, but the SQL gods have blessed it anyway
      // TODO: Optionally allow substitutions
      const statement = this._connection.prepare<SearchRecipesResultRow>(`--sql
        SELECT
          recipe.name, recipe.id,
          COUNT(
            CASE WHEN
              -- Check if fridge has ingredient
              (fridge_ingredient.amount IS NULL)
              -- Optionally check if fridge has enough ingredient
              OR (:checkAmount AND fridge_ingredient.amount < recipe_ingredient.amount)
            THEN 1 END
          ) as missing_count, -- Meaningless if fridgeId is null
          CASE WHEN :search IS NULL THEN NULL ELSE ml_similarity(embedding.embedding, :search) END AS similarity
        FROM recipe
          JOIN embedding ON embedding.sentence = recipe.name
          LEFT JOIN recipe_ingredient ON recipe_ingredient.recipe_id = recipe.id
          LEFT JOIN fridge_ingredient ON fridge_ingredient.ingredient_id = recipe_ingredient.ingredient_id AND fridge_ingredient.fridge_id = :fridgeId
          JOIN ingredient ON ingredient.id = recipe_ingredient.ingredient_id AND NOT ingredient.assumeUnlimited
          LEFT JOIN ingredient_tag ON ingredient_tag.ingredient_id = ingredient.id
        WHERE
          (recipe.meal_type_id = (SELECT id FROM meal_type WHERE name = :mealType) OR :mealType IS NULL)
          AND (similarity >= :minSimilarity OR :search IS NULL)
        GROUP BY recipe.id
        -- COUNT excludes NULLs. Less than used to optionally allow missing ingredients
        HAVING
          (missing_count <= :maxMissingIngredients OR :fridgeId IS NULL)
          -- SUM(CASE WHEN ... THEN 1 ELSE 0 END) = 0 checks for CASE WHEN returning false for all rows
          -- No banned tags
          AND (SUM(CASE WHEN ingredient_tag.tag_id IN (SELECT tag_id FROM ${bannedTagsTable}) THEN 1 ELSE 0 END) = 0)
          -- No banned ingredients
          AND (SUM(CASE WHEN recipe_ingredient.ingredient_id IN (SELECT ingredient_id FROM ${bannedIngredsTable}) THEN 1 ELSE 0 END) = 0)
        ORDER BY missing_count ASC, similarity DESC
        LIMIT :limit
      `)

      return statement.all({
        fridgeId: availableForFridge,
        mealType,
        maxMissingIngredients,
        checkAmount: checkAmounts ? 1 : 0,
        limit,
        search: search !== undefined ? bufferFromFloat32Array(search.embedding) : null,
        minSimilarity
      }).map(row => ({
        id: row.id,
        name: row.name,
        missingIngredientAmount: availableForFridge !== undefined ? row.missing_count : undefined,
        similarity: row.similarity ?? undefined
      }))
    } finally {
      // Ensure that the temp tables are always cleaned up
      // Not too serious if this fails, as the tables are only ever kept in memory
      this._connection.exec(`DROP TABLE IF EXISTS ${bannedIngredsTable}`)
      this._connection.exec(`DROP TABLE IF EXISTS ${bannedTagsTable}`)
    }
  }
}
