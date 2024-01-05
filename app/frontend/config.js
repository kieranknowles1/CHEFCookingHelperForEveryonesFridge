/**
 * Runtime settings for the frontend.
 * This must match the declaration in vite-env.d.ts.
 */

// NOTE: This must be declared as a var, not a const, so it will be available in the window object.
/** @type {import('./src/config').Config} */
var config = {
  API_BASE_URL: 'http://localhost:3000/api/v1'
}
