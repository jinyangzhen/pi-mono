/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Set authentication cookie for testing
       */
      login(): Chainable<void>

      /**
       * Mock the /api/providers endpoint (filtered providers for ChatApp)
       */
      mockProviders(): Chainable<void>

      /**
       * Mock the /api/providers/all endpoint (all providers for SettingsPage)
       */
      mockAllProviders(): Chainable<void>

      /**
       * Mock API key endpoints
       * @param systemKeys - System-level API keys
       * @param userKeys - User-level API keys
       */
      mockApiKeys(
        systemKeys?: Record<string, string>,
        userKeys?: Record<string, string>
      ): Chainable<void>

      /**
       * Open the settings page/dialog
       */
      openSettings(): Chainable<void>
    }
  }
}

export {}