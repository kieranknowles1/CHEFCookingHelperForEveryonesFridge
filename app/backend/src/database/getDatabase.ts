import ChefDatabaseImplementation from './ChefDatabaseImplementation'
import type IChefDatabase from './IChefDatabase'

let instance: IChefDatabase | null = null
export default function getDatabase (): IChefDatabase {
  if (instance === null) {
    instance = new ChefDatabaseImplementation()
  }
  return instance
}
