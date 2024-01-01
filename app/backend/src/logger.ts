import fs from 'fs'

import winston from 'winston'

import { LOG_FILE } from './settings'

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

let instance: ILogger = {
  log: (): void => {
    // Do nothing
  }
}

export function createDefaultLogger (): ILogger {
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE)
  }
  return winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
      new winston.transports.Console({
        format: winston.format.colorize({ all: true })
      }),
      new winston.transports.File({
        filename: LOG_FILE
      })
    ]
  })
}

export function setLogger (logger: ILogger): void {
  instance = logger
}

/**
 * Logging interface for the backend
 * Does nothing by default, must be set with `setLogger` first.
 * ILogger is a subset of the winston logger interface
 */
export default {
  warn: (message: string): void => {
    instance.log(LogLevel.warn, message)
  },
  info: (message: string): void => {
    instance.log(LogLevel.info, message)
  },
  error: (message: string): void => {
    instance.log(LogLevel.error, message)
  },
  /**
   * Helper function for logging from a catch block
   * Logs `err` with the desired `level` if it is an {@link Error}
   * If not, print at level `error` that the error was an unknown type
   */
  caughtError: (err: unknown): void => {
    if (err instanceof Error) {
      instance.log(LogLevel.error, `${err.message} stack ${err.stack}`)
    } else {
      instance.log(LogLevel.error, `Unknown error type ${typeof err}`)
    }
  }
}
