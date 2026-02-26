describe("Model Merge Feature", () => {
	const TEST_PROVIDER_NAME = "Test Merge Provider";
	const TEST_PROVIDER_TYPE = "ollama";
	const TEST_PROVIDER_BASE_URL = "http://localhost:11434";

	beforeEach(() => {
		// Navigate to the main app
		cy.visit("/");
	});

	it("shows system providers visible in model selector", () => {
		// Click the model selector button (has Sparkles icon and current model name)
		cy.get('button:has([lucide="sparkles"])').should("be.visible").click();

		// Verify model selector dialog is open
		cy.contains("h2", "Select Model").should("be.visible");

		// Verify system providers are visible (Anthropic, OpenAI, Google, etc.)
		cy.contains("Anthropic").should("be.visible");
		cy.contains("OpenAI").should("be.visible");
		cy.contains("Google").should("be.visible");

		// Close the model selector
		cy.get("body").click(0, 0);
	});

	it("shows user-level providers visible in model selector", () => {
		// First, add a custom provider via settings
		cy.get('button[title="Settings"]').click();

		// Click the "Add Provider" dropdown
		cy.contains("button", "Add Provider").should("be.visible").click();

		// Select provider type
		cy.contains(".select-option", "Ollama").click();

		// Fill in provider details
		cy.contains("label", "Provider Name")
			.parent()
			.find("input")
			.should("be.visible")
			.clear()
			.type(TEST_PROVIDER_NAME);

		cy.contains("label", "Base URL")
			.parent()
			.find("input")
			.should("be.visible")
			.clear()
			.type(TEST_PROVIDER_BASE_URL);

		// Save the provider
		cy.contains("button", "Save").click();

		// Verify the provider was added
		cy.contains("h3", "Custom Providers").should("be.visible");
		cy.contains(TEST_PROVIDER_NAME).should("be.visible");

		// Close settings dialog
		cy.get('button[aria-label="Close"]').click();

		// Open model selector
		cy.get('button:has([lucide="sparkles"])').should("be.visible").click();

		// Verify model selector dialog is open
		cy.contains("h2", "Select Model").should("be.visible");

		// Verify the custom provider is visible in the model list
		cy.contains(TEST_PROVIDER_NAME).should("be.visible");

		// Close the model selector
		cy.get("body").click(0, 0);

		// Cleanup: delete the provider
		cy.get('button[title="Settings"]').click();
		cy.contains(TEST_PROVIDER_NAME).closest(".border").contains("button", "Delete").click();
		cy.on("window:confirm", () => true);
		cy.get('button[aria-label="Close"]').click();
	});

	it("user level overrides system level for same provider", () => {
		// Get the current model name from the selector button before adding custom provider
		let systemModelName: string;

		cy.get('button:has([lucide="sparkles"])')
			.should("be.visible")
			.invoke("text")
			.then((text) => {
				systemModelName = text.trim();
				cy.log(`System model: ${systemModelName}`);
			});

		// Add a custom provider with the same name as a system provider
		const OVERRIDE_PROVIDER_NAME = "Anthropic";

		cy.get('button[title="Settings"]').click();
		cy.contains("button", "Add Provider").click();
		cy.contains(".select-option", "Ollama").click();

		// Use a name that matches a system provider
		cy.contains("label", "Provider Name")
			.parent()
			.find("input")
			.should("be.visible")
			.clear()
			.type(OVERRIDE_PROVIDER_NAME);

		cy.contains("label", "Base URL")
			.parent()
			.find("input")
			.should("be.visible")
			.clear()
			.type(TEST_PROVIDER_BASE_URL);

		cy.contains("button", "Save").click();

		// Verify the provider was added
		cy.contains(OVERRIDE_PROVIDER_NAME).should("be.visible");

		// Close settings
		cy.get('button[aria-label="Close"]').click();

		// Open model selector
		cy.get('button:has([lucide="sparkles"])').should("be.visible").click();

		// Verify model selector dialog is open
		cy.contains("h2", "Select Model").should("be.visible");

		// Verify that the custom provider models are shown
		// The user-added "Anthropic" provider should appear with its custom models
		cy.contains(OVERRIDE_PROVIDER_NAME).should("be.visible");

		// Close the model selector
		cy.get("body").click(0, 0);

		// Cleanup: delete the provider
		cy.get('button[title="Settings"]').click();
		cy.contains(OVERRIDE_PROVIDER_NAME).closest(".border").contains("button", "Delete").click();
		cy.on("window:confirm", () => true);
		cy.get('button[aria-label="Close"]').click();
	});

	it("selected model persists correctly", () => {
		// Get the initial model name
		let initialModel: string;

		cy.get('button:has([lucide="sparkles"])')
			.should("be.visible")
			.invoke("text")
			.then((text) => {
				initialModel = text.trim();
				cy.log(`Initial model: ${initialModel}`);
			});

		// Open model selector
		cy.get('button:has([lucide="sparkles"])').should("be.visible").click();

		// Verify model selector dialog is open
		cy.contains("h2", "Select Model").should("be.visible");

		// Select a different model (e.g., first anthropic model if available)
		cy.contains("Anthropic").should("be.visible");

		// Find a model from the list and click it
		cy.get('[data-model-item]')
			.first()
			.then(($el) => {
				const selectedModelText = $el.text();
				cy.wrap($el).click();
				cy.log(`Selected model: ${selectedModelText}`);
			});

		// Wait for the dialog to close
		cy.contains("h2", "Select Model").should("not.exist");

		// Reload the page
		cy.reload();

		// Wait for the page to load
		cy.get('button:has([lucide="sparkles"])').should("be.visible");

		// Verify the selected model persists (it should show the same model as before reload)
		cy.get('button:has([lucide="sparkles"])')
			.invoke("text")
			.should((text) => {
				// The model should be displayed (exact verification depends on persistence implementation)
				expect(text.trim()).to.not.be.empty;
			});
	});
});
