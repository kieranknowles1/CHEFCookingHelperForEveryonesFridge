import type User from '../types/User'

import type * as types from './types'
import type IConnection from './IConnection'
import { type IUserDatabase } from './IChefDatabase'
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

    return {
      id: result.id,
      name: result.username
    }
  }
}
