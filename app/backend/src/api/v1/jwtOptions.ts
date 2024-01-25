import { type Params } from 'express-jwt'

import constants from '../../constants'
import environment from '../../environment'

/**
 * Options for JWT
 */
const options: Params = {
  secret: environment.SECRET,
  algorithms: [constants.JWT_ALGORITHM]
}
export default options
