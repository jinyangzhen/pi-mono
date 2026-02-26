describe('Settings Page - E2E Save Behavior', () => {
  beforeEach(() => {
    cy.visit('/settings')
    cy.wait(1000) // Wait for page load
  })

  it('should stay on settings page after saving', () => {
    // Verify we're on settings page
    cy.contains('Settings').should('be.visible')
    cy.contains('API Keys').should('be.visible')
    
    // Click save button (if exists and is enabled)
    cy.get('button').contains('Save').should('be.visible').click()
    
    // Verify we're still on settings page
    cy.url().should('include', '/settings')
    cy.contains('Settings').should('be.visible')
  })

  it('should show success message after save', () => {
    // Click save
    cy.get('button').contains('Save').click()
    
    // Verify success message appears
    cy.contains('Saved successfully').should('be.visible')
    
    // Wait for message to disappear (3 seconds)
    cy.contains('Saved successfully', { timeout: 5000 }).should('not.exist')
  })

  it('should display system API keys section', () => {
    cy.contains('System API Keys').should('be.visible')
  })

  it('should display user API keys section', () => {
    cy.contains('User API Keys').should('be.visible')
  })
})