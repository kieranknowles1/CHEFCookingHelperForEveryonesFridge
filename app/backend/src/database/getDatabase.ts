import { DATABASE_PATH } from '../settings'
import logger from '../logger'

import ChefDatabaseImpl from './ChefDatabaseImpl'
import type IChefDatabase from './IChefDatabase'

let instance: IChefDatabase | null = null
/**
 * @deprecated Pass the database instance around instead
 */
export default function getDatabase (): IChefDatabase {
  if (instance === null) {
    logger.info('Connecting to database')
    instance = new ChefDatabaseImpl(DATABASE_PATH)
  }
  return instance
}
