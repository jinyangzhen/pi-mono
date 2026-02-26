describe('Settings - API Key Editing', () => {
  it('should fetch user API keys', () => {
    cy.request('/api/me/api-keys').then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body).to.have.property('apiKeys')
    })
  })

  it('should fetch system API keys', () => {
    cy.request('/api/system/env-keys').then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body).to.have.property('apiKeys')
    })
  })

  it('should update user API keys', () => {
    cy.request({
      method: 'PUT',
      url: '/api/me/api-keys',
      body: { apiKeys: { 'new-provider': 'new-key' } },
    }).then((response) => {
      expect(response.status).to.equal(200)
    })
  })
})