import type EmbeddedSentence from '../ml/EmbeddedSentence'
import { type IngredientNoId } from '../types/Ingredient'
import { type RecipeNoId } from '../types/Recipe'

import type * as types from './types'
import type IChefDatabase from './IChefDatabase'
import type IConnection from './IConnection'
import { type IWritableDatabase } from './IChefDatabase'
import { bufferFromFloat32Array } from './bufferFloat32Array'

/**
 * Writable interface to the database, passed to the callback of {@link ChefDatabaseImpl.wrapTransaction}
 * and is only valid for the duration of the callback.
 */
export default class WritableDatabaseImpl implements IWritableDatabase {
  private readonly _db: IChefDatabase
  private readonly _connection: IConnection

  /** Whether the WritableDatabase is usable. Only true for the duration of {@link ChefDatabaseImpl.wrapTransaction} */
  private _valid: boolean = true
  public invalidate (): void {
    this._valid = false
  }

  private assertValid (): void {
    if (!this._valid) {
      throw new Error('WritableDatabase has been closed')
    }
  }

  public constructor (db: IChefDatabase, connection: IConnection) {
    this._db = db
    this._connection = connection
  }

  // Check that the ID is not a bigint. Used to areas that work with IDs under the assumption that they are numbers as JSON does not support bigints
  private assertNotBigint (id: number | bigint): asserts id is number {
    if (typeof id === 'bigint') {
      throw new Error('ID returned from database is a bigint')
    }
  }

  public addIngredient (ingredient: IngredientNoId): types.RowId {
    this.assertValid()
    // TODO: Reuse prepared statements
    // TODO: statement pack for writable to only prepare them once
    const statement = this._connection.prepare<undefined>(`
      INSERT INTO ingredient
        (name, assumeUnlimited, preferredUnit, density)
      VALUES
        (:name, :assumeUnlimited, :preferredUnit, :density)
    `)
    const id = statement.run({
      name: ingredient.name,
      assumeUnlimited: ingredient.assumeUnlimited ? 1 : 0,
      preferredUnit: ingredient.preferredUnit,
      density: ingredient.density ?? null
    }).lastInsertRowid
    this.assertNotBigint(id)

    return id
  }

  public addEmbedding (sentence: EmbeddedSentence): void {
    this.assertValid()
    const statement = this._connection.prepare<undefined>(`
      INSERT INTO embedding
        (sentence, embedding)
      VALUES
        (:sentence, :embedding)
      ON CONFLICT DO NOTHING
    `)

    statement.run({
      sentence: sentence.sentence,
      embedding: bufferFromFloat32Array(sentence.embedding)
    })
  }

  public addRecipe (recipe: RecipeNoId): types.RowId {
    this.assertValid()
    const statement = this._connection.prepare<undefined>(`
      INSERT INTO recipe
        (name, directions, link, meal_type_id)
      VALUES
        (:name, :directions, :link, (SELECT id FROM meal_type WHERE name = :mealType))
    `)

    // Add the embedding if it doesn't exist. Only do this once per sentence
    if (this._db.getEmbedding(recipe.name.sentence) === null) {
      this.addEmbedding(recipe.name)
    }

    const id = statement.run({
      name: recipe.name.sentence,
      directions: recipe.directions,
      link: recipe.link,
      mealType: recipe.mealType.sentence
    }).lastInsertRowid
    this.assertNotBigint(id)

    const ingredientStatement = this._connection.prepare<undefined>(`
      INSERT INTO recipe_ingredient
        (recipe_id, ingredient_id, amount, original_line)
      VALUES
        (:recipeId, :ingredientId, :amount, :originalLine)
    `)
    for (const [ingredientId, amount] of recipe.ingredients) {
      ingredientStatement.run({
        recipeId: id,
        ingredientId,
        amount: amount.amount,
        originalLine: amount.originalLine
      })
    }

    return id
  }

  public setIngredientAmount (fridgeId: types.RowId, ingredientId: types.RowId, amount: number): void {
    if (amount === 0) {
      const statement = this._connection.prepare<undefined>(`
        DELETE FROM fridge_ingredient WHERE fridge_id = :fridgeId AND ingredient_id = :ingredientId
      `)
      statement.run({ fridgeId, ingredientId })
    } else {
      const statement = this._connection.prepare<undefined>(`
        INSERT OR REPLACE INTO fridge_ingredient
          (fridge_id, ingredient_id, amount)
        VALUES
          (:fridgeId, :ingredientId, :amount)
      `)
      statement.run({ fridgeId, ingredientId, amount })
    }
  }
}
