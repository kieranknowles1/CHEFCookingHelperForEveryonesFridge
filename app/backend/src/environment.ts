/**
 * Application settings that can be configured via environment variables.
 * NOTE: readme.md has a list of all environment variables. Please keep it up to date with this file.
 */
export default {
  // Setup
  SETUP_LOG_FILE: process.env.CHEF_SETUP_LOG_FILE ?? 'working_data/chefsetup.log',
  SETUP_CSV_FILE: process.env.CHEF_SETUP_CSV_FILE ?? 'working_data/full_dataset.csv',

  // Runtime
  RUNTIME_LOG_FILE: process.env.CHEF_RUNTIME_LOG_FILE ?? 'working_data/chefbackend.log',
  PORT: process.env.CHEF_PORT ?? 3000,
  SECRET: process.env.CHEF_SECRET ?? 'something-secret-here-please-change-me',
  TOKEN_VALIDITY: Number.parseInt(process.env.CHEF_TOKEN_VALIDITY ?? '3600'), // seconds

  // Both
  DATABASE_PATH: process.env.CHEF_DATABASE_PATH ?? 'working_data/chefdatabase.db',
  MIN_LOG_LEVEL: process.env.CHEF_MIN_LOG_LEVEL ?? 'info'
}
