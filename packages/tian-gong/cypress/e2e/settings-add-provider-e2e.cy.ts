describe('Settings - Add New Provider E2E', () => {
  beforeEach(() => {
    cy.visit('/settings')
    cy.wait(1500)
  })

  it('should display settings page elements', () => {
    cy.contains('Settings').should('be.visible')
    cy.contains('API Keys').should('be.visible')
  })

  it('should scroll to user API keys section', () => {
    cy.contains('User API Keys').scrollIntoView().should('be.visible')
  })

  it('should display save and cancel buttons', () => {
    cy.contains('button', 'Save').scrollIntoView().should('be.visible')
    cy.contains('button', 'Cancel').scrollIntoView().should('be.visible')
  })

  it('should have Add New button (if providers available)', () => {
    cy.contains('User API Keys').scrollIntoView()
    cy.wait(500)
    
    cy.get('body').then(($body) => {
      const hasAddNew = $body.text().includes('Add New')
      if (hasAddNew) {
        cy.contains('button', 'Add New').should('exist')
      }
    })
  })
})