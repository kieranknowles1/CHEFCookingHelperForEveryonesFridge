// Copied from https://stackoverflow.com/questions/50019920/javascript-map-key-value-pairs-case-insensitive-search

/**
 * Case insensitive map
 * Only supports string keys
 */
export default class CaseInsensitiveMap<T> extends Map<string, T> {
  set (key: string, value: T): this {
    key = key.toLowerCase()
    return super.set(key, value)
  }

  get (key: string): T | undefined {
    key = key.toLowerCase()

    return super.get(key)
  }

  has (key: string): boolean {
    key = key.toLowerCase()

    return super.has(key)
  }
}
