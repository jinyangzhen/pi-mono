const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1920,
    viewportHeight: 1080,
    screenshotOnRunFailure: true,
  },
  env: {
    apiUrl: 'http://localhost:3000/api',
  },
})
