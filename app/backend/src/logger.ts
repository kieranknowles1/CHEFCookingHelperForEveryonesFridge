import fs from 'fs'

import winston from 'winston'

// TODO: Env variables
const MIN_LOG_LEVEL = 'info'
const LOG_FILE = 'working_data/chefbackend.log'

export enum LogLevel {
  error = 'error',
  warn = 'warn',
  info = 'info',
  http = 'http',
  verbose = 'verbose',
  debug = 'debug',
  silly = 'silly',
}

if (fs.existsSync(LOG_FILE)) {
  fs.unlinkSync(LOG_FILE)
}

const logger = winston.createLogger({
  level: MIN_LOG_LEVEL,
  format: winston.format.prettyPrint(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: LOG_FILE })
  ]
})
export default logger

/**
 * Helper function for logging from a catch block
 * Logs `err` with the desired `level` if it is an {@link Error}
 * If not, print at level `error` that the error was an unknown type
 * @param [level='error'] Log level to use, default `error`
 */
export function logError (err: unknown, level: LogLevel = LogLevel.error): void {
  if (err instanceof Error) {
    logger.log(level, `${err.message} stack ${err.stack}`)
  } else {
    logger.error(`Unknown error type ${typeof err}`)
  }
}
