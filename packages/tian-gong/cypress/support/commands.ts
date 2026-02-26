/// <reference types="cypress" />

Cypress.Commands.add('login', () => {
  cy.setCookie('tian-gong-session', 'test-session-id')
})

Cypress.Commands.add('mockProviders', () => {
  // Mock filtered providers (for ChatApp)
  cy.intercept('GET', '/api/providers', {
    providers: [
      { id: 'minimax-cn', name: 'MiniMax CN' },
      { id: 'zai', name: 'Zai' },
    ],
    models: {
      'minimax-cn': [
        { id: 'MiniMax-M2', name: 'MiniMax-M2' },
        { id: 'MiniMax-M2.1', name: 'MiniMax-M2.1' },
      ],
      'zai': [
        { id: 'glm-4.7', name: 'GLM-4.7' },
        { id: 'glm-4.7-flash', name: 'GLM-4.7-Flash' },
      ],
    },
  }).as('getProviders')
})

Cypress.Commands.add('mockAllProviders', () => {
  // Mock all providers (for SettingsPage)
  cy.intercept('GET', '/api/providers/all', {
    providers: [
      { id: 'amazon-bedrock', name: 'AWS Bedrock' },
      { id: 'anthropic', name: 'Anthropic' },
      { id: 'minimax-cn', name: 'MiniMax CN' },
      { id: 'zai', name: 'Zai' },
    ],
  }).as('getAllProviders')
})

Cypress.Commands.add('mockApiKeys', (systemKeys = {}, userKeys = {}) => {
  cy.intercept('GET', '/api/system/env-keys', {
    apiKeys: systemKeys,
  }).as('getSystemApiKeys')
  
  cy.intercept('GET', '/api/me/api-keys', {
    apiKeys: userKeys,
  }).as('getUserApiKeys')
})

Cypress.Commands.add('openSettings', () => {
  cy.get('[data-testid="settings-button"]').click()
})