import type User from '../types/User'
import { type UserCredentials } from '../types/User'

import type * as types from './types'
import { type GetHistoryParams, type IUserDatabase, type MadeRecipeItem } from './IChefDatabase'
import type IConnection from './IConnection'
import InvalidIdError from './InvalidIdError'

export default class UserDatabaseImpl implements IUserDatabase {
  private readonly _connection: IConnection

  public constructor (connection: IConnection) {
    this._connection = connection
  }

  public get (id: types.RowId): User {
    const statement = this._connection.prepare<types.UserRow>(`
      SELECT * FROM user WHERE id = :id
    `)
    const result = statement.get({ id })

    if (result === undefined) {
      throw new InvalidIdError('user', id)
    }

    const bannedTags = this._connection.prepare<types.TagRow>(`
      SELECT tag.*
      FROM user_banned_tag
      JOIN tag ON tag.id = user_banned_tag.tag_id
      WHERE user_banned_tag.user_id = :id
    `).all({ id })

    const bannedIngredients = this._connection.prepare<{ name: string, id: types.RowId }>(`
      SELECT name, id
      FROM user_banned_ingredient
      JOIN ingredient ON ingredient.id = user_banned_ingredient.ingredient_id
      WHERE user_banned_ingredient.user_id = :id
    `).all({ id })

    return {
      id: result.id,
      name: result.username,
      bannedTags: new Map(bannedTags.map(row => [row.id, row])),
      bannedIngredients: new Map(bannedIngredients.map(row => [row.id, row.name]))
    }
  }

  public getHistory (params: GetHistoryParams): MadeRecipeItem[] {
    interface Result {
      item_id: types.RowId
      recipe_id: types.RowId
      recipe_name: string
      fridge_name: string
      fridge_id: types.RowId
      // JSON array of user names
      user_names: string
      // JSON array of user ids
      user_ids: string
      date_made: string
    }
    // Nothing too menacing here, just a lot of JOINS
    // If you're afraid of this, don't even look at the search query, that's a monster
    const statement = this._connection.prepare<Result>(`
      SELECT
        made_recipe.id AS item_id,
        made_recipe.recipe_id,
        recipe.name AS recipe_name,
        fridge.name AS fridge_name,
        fridge.id AS fridge_id,
        json_group_array(user.username) AS user_names,
        json_group_array(user.id) AS user_ids,
        made_recipe.date_made
      FROM made_recipe
      JOIN made_recipe_user ON made_recipe_user.made_recipe_id = made_recipe.id
      JOIN recipe ON recipe.id = made_recipe.recipe_id
      JOIN fridge ON fridge.id = made_recipe.fridge_id
      JOIN user ON user.id = made_recipe_user.user_id
      WHERE (:recipeId IS NULL OR made_recipe.recipe_id = :recipeId)
      GROUP BY made_recipe.id
      -- Filter so that at least one of the users is the one we want
      HAVING MAX(made_recipe_user.user_id = :userId) = true
      ORDER BY made_recipe.date_made DESC
      LIMIT :limit
    `)

    const result = statement.all({
      userId: params.userId,
      limit: params.limit,
      recipeId: params.recipeId ?? null
    })
    const output: MadeRecipeItem[] = []

    for (const row of result) {
      // Know what the types are because of the query
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const userNames = JSON.parse(row.user_names) as string[]
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const userIds = JSON.parse(row.user_ids) as types.RowId[]
      output.push({
        id: row.item_id,
        recipe: {
          id: row.recipe_id,
          name: row.recipe_name
        },
        fridge: {
          id: row.fridge_id,
          name: row.fridge_name
        },
        users: userIds.map((id, index) => ({
          id,
          name: userNames[index]
        })),
        dateMade: new Date(row.date_made)
      })
    }
    return output
  }

  public getCredentials (username: string): UserCredentials | null {
    interface Result {
      id: types.RowId
      username: string
      password_hash: string
    }
    const statement = this._connection.prepare<Result>(`
      SELECT
        id,
        username
        -- // TODO: Add password hashing
        -- password_hash
      FROM user
        WHERE username = :username COLLATE NOCASE
    `)
    const result = statement.get({ username })

    if (result === undefined) {
      return null
    }

    return {
      id: result.id,
      name: result.username,
      passwordHash: result.password_hash
    }
  }
}
