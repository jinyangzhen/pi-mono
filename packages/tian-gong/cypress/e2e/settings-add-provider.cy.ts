describe('Settings - Add Provider API', () => {
  beforeEach(() => {
    cy.mockAllProviders()
  })

  it('should return all providers from pi-ai', () => {
    cy.request('/api/providers/all').then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body).to.have.property('providers')
      expect(response.body.providers).to.be.an('array')
      
      // Should have all 22 providers
      expect(response.body.providers.length).to.be.greaterThan(20)
      
      // Should include various providers
      const providerIds = response.body.providers.map((p: any) => p.id)
      expect(providerIds).to.include('anthropic')
      expect(providerIds).to.include('openai')
      expect(providerIds).to.include('minimax-cn')
      expect(providerIds).to.include('zai')
    })
  })

  it('should not return models field', () => {
    cy.request('/api/providers/all').then((response) => {
      expect(response.body).to.not.have.property('models')
    })
  })

  it('should return provider with id and name', () => {
    cy.request('/api/providers/all').then((response) => {
      const provider = response.body.providers[0]
      expect(provider).to.have.property('id')
      expect(provider).to.have.property('name')
    })
  })
})