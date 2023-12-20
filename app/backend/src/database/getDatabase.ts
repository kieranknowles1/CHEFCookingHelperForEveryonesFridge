import logger from '../logger'

import ChefDatabaseImplementation from './ChefDatabaseImplementation'
import type IChefDatabase from './IChefDatabase'

let instance: IChefDatabase | null = null
export default function getDatabase (): IChefDatabase {
  if (instance === null) {
    logger.info('Connecting to database')
    instance = new ChefDatabaseImplementation()
  }
  return instance
}
