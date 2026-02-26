describe('Settings - Save Behavior', () => {
  it('should save API keys successfully', () => {
    cy.request({
      method: 'PUT',
      url: '/api/me/api-keys',
      body: { apiKeys: { 'test-provider': 'test-key-123' } },
    }).then((response) => {
      expect(response.status).to.equal(200)
    })
  })

  it('should return updated API keys after save', () => {
    // First save
    cy.request({
      method: 'PUT',
      url: '/api/me/api-keys',
      body: { apiKeys: { 'minimax-cn': 'saved-key' } },
    })

    // Then verify they were saved
    cy.request('/api/me/api-keys').then((response) => {
      expect(response.body.apiKeys).to.have.property('minimax-cn')
    })
  })
})