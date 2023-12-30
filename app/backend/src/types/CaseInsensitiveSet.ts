// Based on https://stackoverflow.com/questions/50019920/javascript-map-key-value-pairs-case-insensitive-search

/**
 * Case insensitive set of strings
 */
export default class CaseInsensitiveSet extends Set<string> {
  add (value: string): this {
    value = value.toLowerCase()
    return super.add(value)
  }

  delete (value: string): boolean {
    value = value.toLowerCase()
    return super.delete(value)
  }

  has (key: string): boolean {
    key = key.toLowerCase()

    return super.has(key)
  }
}
