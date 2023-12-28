import logger from '../logger'

import ChefDatabaseImpl from './ChefDatabaseImpl'
import type IChefDatabase from './IChefDatabase'

let instance: IChefDatabase | null = null
export default function getDatabase (): IChefDatabase {
  if (instance === null) {
    logger.info('Connecting to database')
    instance = new ChefDatabaseImpl()
  }
  return instance
}
