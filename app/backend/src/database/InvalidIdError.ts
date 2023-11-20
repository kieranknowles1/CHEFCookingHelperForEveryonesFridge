import CodedError from '../CodedError'

import { type RowId } from './types'

export default class InvalidIdError extends CodedError {
  public readonly code = 404
  constructor (table: string, id: RowId) {
    super(`Invalid ID ${id} for table ${table}`)
  }
}
