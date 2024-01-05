/**
 * Runtime configuration for the app. Values are defined in config.js and injected into the app by including the script
 * in index.html. This file is used to provide type information for the injected values.
 * There is no need to import this file anywhere, it is available globally through the window.config object.
 */

export interface Config {
  API_BASE_URL: string
}

declare global {
  /**
   * Add properties to the global window object.
   * This must match the globals declared in config.js
   */
  interface Window {
    config: Config
  }
}
