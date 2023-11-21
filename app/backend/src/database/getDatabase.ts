import logger, { LogLevel } from '../logger'

import ChefDatabaseImplementation from './ChefDatabaseImplementation'
import type IChefDatabase from './IChefDatabase'

let instance: IChefDatabase | null = null
export default function getDatabase (): IChefDatabase {
  if (instance === null) {
    logger.log(LogLevel.info, 'Connecting to database')
    instance = new ChefDatabaseImplementation()
  }
  return instance
}
