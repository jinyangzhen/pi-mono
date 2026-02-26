describe('Chat App - Model Selection E2E', () => {
  beforeEach(() => {
    cy.visit('/chat')
    cy.wait(1500) // Wait for page to fully load
  })

  it('should display model selector button', () => {
    cy.get('button').contains(/Select model|MiniMax|Zai/).should('be.visible')
  })

  it('should open dropdown when clicking model selector', () => {
    cy.get('button').contains(/Select model|MiniMax|Zai/).click()
    cy.wait(300) // Wait for dropdown animation
    cy.contains('MiniMax').should('be.visible')
    cy.contains('Zai').should('be.visible')
  })

  it('should show model names in provider/model format', () => {
    cy.get('button').contains(/Select model|MiniMax|Zai/).click()
    cy.wait(300)
    cy.contains(/MiniMax.*\//).should('be.visible')
    cy.contains(/Zai.*\//).should('be.visible')
  })

  it('should select a model from dropdown', () => {
    // Open dropdown
    cy.get('button').contains(/Select model|MiniMax|Zai/).click()
    cy.wait(300)
    
    // Click on a model option
    cy.get('button').filter(':visible').contains(/MiniMax/).first().click()
    cy.wait(500)
    
    // Verify selection is shown in button (dropdown should close)
    cy.get('button').contains(/MiniMax.*\//).should('be.visible')
  })

  it('should have working dropdown functionality', () => {
    // Basic test - just verify dropdown works
    cy.get('button').contains(/Select model|MiniMax|Zai/).click()
    cy.wait(300)
    
    // Options should be visible
    cy.contains(/MiniMax|Zai/).should('be.visible')
  })
})