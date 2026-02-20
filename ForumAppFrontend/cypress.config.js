const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Timeout and retry settings
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    retries: {
      runMode: 2,
      openMode: 0
    },
    // Network error handling
    chromeWebSecurity: false,
    video: false,
    screenshotOnRunFailure: true,
    // CORS handling
    experimentalSessionAndOrigin: true
  },
});
