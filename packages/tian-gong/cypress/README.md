# Cypress E2E Tests for Tian-Gong

This directory contains Cypress end-to-end tests for regression testing of the Tian-Gong application.

## Test Coverage

### 1. Settings Page - Save Behavior (`settings-save-behavior.cy.ts`)
Tests that the settings page stays on the page after saving API keys (doesn't navigate back).

**Scenarios:**
- ✅ Stay on settings page after clicking Save
- ✅ No navigation to previous page after save
- ✅ Success message appears and disappears after 3 seconds

### 2. Settings Page - API Key Editing (`settings-api-key-editing.cy.ts`)
Tests the inline editing functionality for API keys in the settings page.

**Scenarios:**
- ✅ Pencil icon appears on hover over masked key
- ✅ Key becomes editable on click
- ✅ Save edited key on blur (click outside)
- ✅ Save edited key on Enter key
- ✅ Cancel edit on Escape key (restore original)
- ✅ System level keys don't have edit button

### 3. Settings Page - Add New Provider (`settings-add-provider.cy.ts`)
Tests the "Add New" provider functionality in settings.

**Scenarios:**
- ✅ "Add New" button visible when providers available
- ✅ Dropdown opens showing available (unconfigured) providers
- ✅ Already configured providers (system or user) not in dropdown
- ✅ Clicking provider adds it to user's API keys
- ✅ "Add New" button hidden when all providers configured
- ✅ Uses `/api/providers/all` endpoint (not filtered)

### 4. ChatApp - Model Selection (`chat-model-selection.cy.ts`)
Tests the model selection dropdown in the ChatApp.

**Scenarios:**
- ✅ Only shows providers with API keys
- ✅ Providers without API keys not shown
- ✅ Displays in provider/model format
- ✅ Selected model shown in button
- ✅ Uses `/api/providers` (filtered) endpoint
- ✅ Remembers selected model after page reload
- ✅ Dropdown closes when clicking outside

### 5. API Separation (`api-separation.cy.ts`)
Tests that the two provider endpoints work correctly.

**Scenarios:**
- ✅ `/api/providers` returns filtered providers + models
- ✅ `/api/providers/all` returns all providers, no models
- ✅ Both endpoints require authentication
- ✅ Provider labels are consistent across endpoints

### 6. UI Theme - Dropdown Styling (`ui-theme-dropdown.cy.ts`)
Tests that dropdowns use correct theme colors.

**Scenarios:**
- ✅ Model dropdown uses `bg-card` background (not black)
- ✅ Hover state uses `hover:bg-muted`
- ✅ Selected state uses `bg-muted`
- ✅ Settings dropdown matches theme
- ✅ Consistent with ModeSwitcher dropdown styling

## Running Tests

### Install Cypress (first time)
```bash
cd packages/tian-gong
npm run cy:install
```

### Run tests in headless mode
```bash
cd packages/tian-gong
npm run test:e2e
```

### Open Cypress Test Runner (interactive mode)
```bash
cd packages/tian-gong
npm run test:e2e:open
```

### Run specific test file
```bash
cd packages/tian-gong
npx cypress run --spec "cypress/e2e/chat-model-selection.cy.ts"
```

## Prerequisites

1. Backend server must be running on `http://localhost:5000`
2. Frontend must be built and served

### Quick start for testing:
```bash
# Terminal 1: Start backend
cd packages/tian-gong
npm run build
npm run dev

# Terminal 2: Start frontend
cd packages/tian-gong/fronts
npm run dev:all

# Terminal 3: Run tests
cd packages/tian-gong
npm run test:e2e
```

## Custom Commands

The following custom Cypress commands are available in `support/commands.ts`:

- `cy.login()` - Sets authentication cookie
- `cy.mockProviders()` - Mocks `/api/providers` (filtered)
- `cy.mockAllProviders()` - Mocks `/api/providers/all` (all providers)
- `cy.mockApiKeys(systemKeys, userKeys)` - Mocks API key endpoints
- `cy.openSettings()` - Opens settings dialog/page

## Data Test IDs

The tests expect the following `data-testid` attributes on elements:

### Settings Page
- `[data-testid="settings-button"]` - Settings button
- `[data-testid="api-key-row-{providerId}"]` - API key row
- `[data-testid="key-value"]` - Key value display
- `[data-testid="edit-icon"]` - Edit icon
- `[data-testid="add-provider-dropdown"]` - Add provider dropdown
- `[data-testid="add-provider-option"]` - Provider option in dropdown

### Chat Page
- `[data-testid="model-selector"]` - Model selector button
- `[data-testid="model-dropdown"]` - Model dropdown container
- `[data-testid="model-option"]` - Model option in dropdown

### Navigation
- `[data-testid="mode-switcher"]` - Mode switcher (Chat/Terminal)
- `[data-testid="mode-switcher-dropdown"]` - Mode switcher dropdown
- `[data-testid="mode-option"]` - Mode option in dropdown

## Notes

- Tests use mocked API responses to ensure consistent behavior
- No real API keys are used in tests
- Tests cover both light and dark theme scenarios
- Screenshots are taken on test failures for debugging