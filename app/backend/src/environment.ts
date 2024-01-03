/**
 * Application settings that can be configured via environment variables.
 */
export default {
  DATABASE_PATH: process.env.DATABASE_PATH ?? 'working_data/chefdatabase.db',
  SETUP_LOG_FILE: process.env.SETUP_LOG_FILE ?? 'working_data/chefsetup.log',
  RUNTIME_LOG_FILE: process.env.RUNTIME_LOG_FILE ?? 'working_data/chefbackend.log',

  PORT: process.env.PORT ?? 3000
}
