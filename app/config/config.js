/**
 * Runtime settings for the frontend.
 * This must match the declaration in vite-env.d.ts.
 */

// NOTE: This must be declared as a var, not a const, so it will be available in the window object.
/** @type {import('../frontend/src/config').Config} */
var config = {
  API_BASE_URL: 'https://chefapi.knowles.freemyip.com/api/v1'
}
