describe('ChatApp - Model Selection API', () => {
  beforeEach(() => {
    cy.mockProviders()
  })

  it('should use /api/providers (filtered) endpoint', () => {
    // Make request to the filtered providers endpoint
    cy.request('/api/providers').then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body).to.have.property('providers')
      expect(response.body).to.have.property('models')
      
      // Should only return providers with API keys
      const providerIds = response.body.providers.map((p: any) => p.id)
      expect(providerIds).to.include.members(['minimax-cn', 'zai'])
    })
  })

  it('should return models for each provider', () => {
    cy.request('/api/providers').then((response) => {
      const providerIds = response.body.providers.map((p: any) => p.id)
      
      providerIds.forEach((id: string) => {
        expect(response.body.models).to.have.property(id)
        expect(response.body.models[id]).to.be.an('array')
      })
    })
  })

  it('should only include providers with API keys configured', () => {
    cy.request('/api/providers').then((response) => {
      const providerIds = response.body.providers.map((p: any) => p.id)
      
      // Should only have the two providers with mock API keys
      expect(providerIds).to.have.lengthOf(2)
      expect(providerIds).to.include('minimax-cn')
      expect(providerIds).to.include('zai')
    })
  })
})