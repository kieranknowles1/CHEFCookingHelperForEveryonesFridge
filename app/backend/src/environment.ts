/**
 * Application settings that can be configured via environment variables.
 */
export default {
  // Setup
  SETUP_LOG_FILE: process.env.CHEF_SETUP_LOG_FILE ?? 'working_data/chefsetup.log',
  SETUP_CSV_FILE: process.env.CHEF_SETUP_CSV_FILE ?? 'working_data/full_dataset.csv',

  // Runtime
  RUNTIME_LOG_FILE: process.env.CHEF_RUNTIME_LOG_FILE ?? 'working_data/chefbackend.log',
  PORT: process.env.CHEF_PORT ?? 3000,

  // Both
  DATABASE_PATH: process.env.CHEF_DATABASE_PATH ?? 'working_data/chefdatabase.db'
}
