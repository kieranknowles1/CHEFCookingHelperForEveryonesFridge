// Config file for development only. This file is not used in production.
// You probably want to use the config file in the setup folder instead.

// NOTE: This must be declared as a var, not a const, so it will be available in the window object.
/** @type {import('../frontend/src/config').Config} */
var config = {
  API_BASE_URL: 'http://localhost:3000/api/v1'
}
