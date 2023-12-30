import assertNotNull from './assertNotNull'

export interface ILogger {
  log: (level: string, message: string) => void
}

export enum LogLevel {
  error = 'error',
  warn = 'warn',
  info = 'info',
  http = 'http',
  verbose = 'verbose',
  debug = 'debug',
  silly = 'silly',
}

let instance: ILogger | undefined

export function initializeLogger (logger: ILogger): void {
  instance = logger
}

export default {
  warn: (message: string): void => {
    assertNotNull(instance)
    instance.log(LogLevel.warn, message)
  },
  info: (message: string): void => {
    assertNotNull(instance)
    instance.log(LogLevel.info, message)
  },
  error: (message: string): void => {
    assertNotNull(instance)
    instance.log(LogLevel.error, message)
  },
  /**
   * Helper function for logging from a catch block
   * Logs `err` with the desired `level` if it is an {@link Error}
   * If not, print at level `error` that the error was an unknown type
   */
  caughtError: (err: unknown): void => {
    assertNotNull(instance)
    if (err instanceof Error) {
      instance.log(LogLevel.error, `${err.message} stack ${err.stack}`)
    } else {
      instance.log(LogLevel.error, `Unknown error type ${typeof err}`)
    }
  }
}
