import path from 'path'

/**
 * Application constants that should not be configurable.
 */
export default {
  API_SPEC_PATH: './api.yml',
  SQL_DUMMY_DATA_PATH: path.join(process.cwd(), 'data/dummydata.sql')
}
