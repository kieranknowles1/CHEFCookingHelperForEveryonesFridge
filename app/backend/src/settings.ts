import path from 'path'

// TODO: Should have some of these be environment variables
/**
 * Settings for the application
 */

export const DATABASE_PATH = path.join(process.cwd(), 'working_data/chefdatabase.db')

export const PORT = 3000

export const API_SPEC_PATH = './api.yml'
