export default class DataImportError extends Error {
  readonly detail?: string

  constructor (message: string, detail?: string) {
    super(message)
    this.name = DataImportError.name
    this.detail = detail
  }
}
