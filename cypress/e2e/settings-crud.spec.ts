describe('Settings CRUD', () => {
	const TEST_PROVIDER_NAME = 'Test Ollama';
	const TEST_PROVIDER_TYPE = 'ollama';
	const TEST_PROVIDER_BASE_URL = 'http://localhost:11434';
	const TEST_PROVIDER_UPDATED_URL = 'http://localhost:11434/v1';
	const TEST_API_KEY = 'sk-test-api-key-12345';

	beforeEach(() => {
		// Navigate to the main app (settings is opened via dialog)
		cy.visit('/');
	});

	it('opens settings dialog', () => {
		// Click the settings button (icon with Settings)
		cy.get('button[title="Settings"]').should('be.visible').click();

		// Verify settings dialog is open
		cy.contains('h2', 'Settings').should('be.visible');

		// Verify tabs are visible
		cy.contains('Providers & Models').should('be.visible');
		cy.contains('Proxy').should('be.visible');
	});

	it('adds a new custom provider', () => {
		// Open settings dialog
		cy.get('button[title="Settings"]').click();

		// Verify we're on the Providers & Models tab by default
		cy.contains('Providers & Models').should('be.visible');

		// Click the "Add Provider" dropdown
		cy.contains('button', 'Add Provider').should('be.visible').click();

		// Select provider type
		cy.contains('.select-option', 'Ollama').click();

		// Verify the custom provider dialog is open
		cy.contains('h2', 'Add Provider').should('be.visible');

		// Fill in provider details
		cy.contains('label', 'Provider Name')
			.parent()
			.find('input')
			.should('be.visible')
			.clear()
			.type(TEST_PROVIDER_NAME);

		cy.contains('label', 'Base URL')
			.parent()
			.find('input')
			.should('be.visible')
			.clear()
			.type(TEST_PROVIDER_BASE_URL);

		// Save the provider
		cy.contains('button', 'Save').click();

		// Verify the provider was added
		cy.contains('h3', 'Custom Providers').should('be.visible');
		cy.contains(TEST_PROVIDER_NAME).should('be.visible');
		cy.contains(TEST_PROVIDER_BASE_URL).should('be.visible');

		// Close the settings dialog
		cy.get('button[aria-label="Close"]').click();
	});

	it('edits a custom provider', () => {
		// First, add a provider
		cy.get('button[title="Settings"]').click();
		cy.contains('button', 'Add Provider').click();
		cy.contains('.select-option', 'Ollama').click();
		cy.contains('label', 'Provider Name')
			.parent()
			.find('input')
			.clear()
			.type(TEST_PROVIDER_NAME);
		cy.contains('label', 'Base URL')
			.parent()
			.find('input')
			.clear()
			.type(TEST_PROVIDER_BASE_URL);
		cy.contains('button', 'Save').click();

		// Verify the provider was added
		cy.contains(TEST_PROVIDER_NAME).should('be.visible');

		// Find and click the Edit button for the provider
		cy.contains(TEST_PROVIDER_NAME)
			.closest('.border')
			.contains('button', 'Edit')
			.click();

		// Verify the edit dialog is open
		cy.contains('h2', 'Edit Provider').should('be.visible');

		// Update the base URL
		cy.contains('label', 'Base URL')
			.parent()
			.find('input')
			.clear()
			.type(TEST_PROVIDER_UPDATED_URL);

		// Save the changes
		cy.contains('button', 'Save').click();

		// Verify the provider was updated
		cy.contains(TEST_PROVIDER_UPDATED_URL).should('be.visible');

		// Close settings
		cy.get('button[aria-label="Close"]').click();
	});

	it('deletes a custom provider', () => {
		// First, add a provider
		cy.get('button[title="Settings"]').click();
		cy.contains('button', 'Add Provider').click();
		cy.contains('.select-option', 'Ollama').click();
		cy.contains('label', 'Provider Name')
			.parent()
			.find('input')
			.clear()
			.type(TEST_PROVIDER_NAME);
		cy.contains('label', 'Base URL')
			.parent()
			.find('input')
			.clear()
			.type(TEST_PROVIDER_BASE_URL);
		cy.contains('button', 'Save').click();

		// Verify the provider was added
		cy.contains(TEST_PROVIDER_NAME).should('be.visible');

		// Find and click the Delete button for the provider
		cy.contains(TEST_PROVIDER_NAME)
			.closest('.border')
			.contains('button', 'Delete')
			.click();

		// Confirm the deletion in the browser confirm dialog
		cy.on('window:confirm', (text) => {
			expect(text).to.include('Are you sure you want to delete this provider?');
			return true;
		});

		// Verify the provider was deleted
		cy.contains(TEST_PROVIDER_NAME).should('not.exist');

		// Close settings
		cy.get('button[aria-label="Close"]').click();
	});

	it('edits API key for a cloud provider', () => {
		// Open settings dialog
		cy.get('button[title="Settings"]').click();

		// Find the Anthropic provider section
		cy.contains('.text-sm', 'Anthropic').should('be.visible');

		// Click on the API key input field
		cy.contains('.text-sm', 'Anthropic')
			.closest('.space-y-3')
			.find('input[type="password"]')
			.should('be.visible')
			.clear()
			.type(TEST_API_KEY);

		// Click the Save button
		cy.contains('.text-sm', 'Anthropic')
			.closest('.space-y-3')
			.contains('button', 'Save')
			.click();

		// Verify the save indicator (green checkmark)
		cy.contains('.text-sm', 'Anthropic')
			.closest('.space-y-3')
			.find('.text-green-600, .dark\\:text-green-400')
			.should('be.visible');

		// Close settings
		cy.get('button[aria-label="Close"]').click();
	});

	it('saves settings and verifies persistence after reload', () => {
		// Open settings and add a provider
		cy.get('button[title="Settings"]').click();
		cy.contains('button', 'Add Provider').click();
		cy.contains('.select-option', 'Ollama').click();
		cy.contains('label', 'Provider Name')
			.parent()
			.find('input')
			.clear()
			.type(TEST_PROVIDER_NAME);
		cy.contains('label', 'Base URL')
			.parent()
			.find('input')
			.clear()
			.type(TEST_PROVIDER_BASE_URL);
		cy.contains('button', 'Save').click();

		// Verify the provider was added
		cy.contains(TEST_PROVIDER_NAME).should('be.visible');

		// Close settings
		cy.get('button[aria-label="Close"]').click();

		// Reload the page
		cy.reload();

		// Open settings again
		cy.get('button[title="Settings"]').click();

		// Verify the provider persists after reload
		cy.contains(TEST_PROVIDER_NAME).should('be.visible');
		cy.contains(TEST_PROVIDER_BASE_URL).should('be.visible');

		// Cleanup: delete the provider
		cy.contains(TEST_PROVIDER_NAME)
			.closest('.border')
			.contains('button', 'Delete')
			.click();

		// Confirm deletion
		cy.on('window:confirm', () => true);

		// Close settings
		cy.get('button[aria-label="Close"]').click();
	});
});
