describe('Settings - API Key Display E2E', () => {
  beforeEach(() => {
    cy.visit('/settings')
    cy.wait(1500)
  })

  it('should display user API keys section', () => {
    cy.contains('User API Keys').should('be.visible')
  })

  it('should display system API keys section', () => {
    cy.contains('System API Keys').should('be.visible')
  })

  it('should have save button', () => {
    cy.contains('button', 'Save').should('be.visible')
  })

  it('should have cancel button', () => {
    cy.contains('button', 'Cancel').should('be.visible')
  })

  it('should display settings page correctly', () => {
    cy.contains('Settings').should('be.visible')
    cy.contains('API Keys').should('be.visible')
  })
})