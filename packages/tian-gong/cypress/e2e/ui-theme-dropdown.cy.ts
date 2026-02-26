describe('API Response Structure', () => {
  it('should have correct structure for provider dropdown', () => {
    cy.request('/api/providers').then((response) => {
      const { providers, models } = response.body
      
      // Providers should be array
      expect(providers).to.be.an('array')
      
      // Models should be object
      expect(models).to.be.an('object')
      
      // Each provider should have id and name
      providers.forEach((p: any) => {
        expect(p).to.have.property('id')
        expect(p).to.have.property('name')
      })
      
      // For each provider in providers, there should be models
      providers.forEach((p: any) => {
        if (models[p.id]) {
          expect(models[p.id]).to.be.an('array')
          models[p.id].forEach((m: any) => {
            expect(m).to.have.property('id')
            expect(m).to.have.property('name')
          })
        }
      })
    })
  })

  it('should have correct structure for all providers endpoint', () => {
    cy.request('/api/providers/all').then((response) => {
      const { providers } = response.body
      
      // Should not have models
      expect(response.body).to.not.have.property('models')
      
      // Should have array of providers
      expect(providers).to.be.an('array')
      
      // Each provider should have id and name
      providers.forEach((p: any) => {
        expect(p).to.have.property('id')
        expect(p).to.have.property('name')
        expect(p.id).to.be.a('string')
        expect(p.name).to.be.a('string')
      })
    })
  })

  it('should differentiate between filtered and all endpoints', () => {
    cy.request('/api/providers').then((filteredResponse) => {
      cy.request('/api/providers/all').then((allResponse) => {
        // All should have more providers than filtered
        expect(allResponse.body.providers.length).to.be.greaterThan(
          filteredResponse.body.providers.length
        )
        
        // Filtered should have models, all should not
        expect(filteredResponse.body).to.have.property('models')
        expect(allResponse.body).to.not.have.property('models')
      })
    })
  })
})