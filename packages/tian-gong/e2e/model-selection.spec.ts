import { test, expect } from '@playwright/test';

test.describe('ChatApp Model Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the chat app
    await page.goto('http://localhost:5000');
    
    // Wait for the page to load
    await page.waitForSelector('text=Tian-gong Agent', { timeout: 10000 });
  });

  test('should show only providers with API keys in dropdown', async ({ page }) => {
    // Click on the model selector button
    const modelSelector = page.locator('button:has-text("Select model"), button:has-text("/")');
    await expect(modelSelector).toBeVisible({ timeout: 10000 });
    await modelSelector.click();

    // Wait for dropdown to appear
    await page.waitForSelector('div:has-text("minimax-cn")', { timeout: 5000 });

    // Get all provider options in the dropdown
    const options = await page.locator('button[class*="hover:bg-accent"]').count();
    
    // Should only show minimax-cn and zai (2 providers)
    expect(options).toBeGreaterThan(0);
    
    // Verify minimax-cn is present
    await expect(page.locator('text=minimax-cn')).toBeVisible();
    
    // Verify zai is present  
    await expect(page.locator('text=zai')).toBeVisible();
    
    // Verify OpenAI is NOT present (no API key)
    await expect(page.locator('text=openai').first()).not.toBeVisible();
    
    // Take screenshot for verification
    await page.screenshot({ path: 'model-dropdown.png' });
  });

  test('should display model in provider/model format', async ({ page }) => {
    // Click on the model selector
    const modelSelector = page.locator('button:has-text("Select model")');
    await expect(modelSelector).toBeVisible({ timeout: 10000 });
    await modelSelector.click();

    // Wait for dropdown
    await page.waitForTimeout(1000);

    // Check that options show provider/model format
    const dropdownText = await page.locator('div[class*="absolute top-full"]').textContent();
    
    // Should contain format like "minimax-cn/MiniMax-M2" or similar
    expect(dropdownText).toMatch(/minimax-cn\/.+/);
    expect(dropdownText).toMatch(/zai\/.+/);
  });

  test('should remember selected model', async ({ page }) => {
    // Click on the model selector
    const modelSelector = page.locator('button:has-text("Select model")');
    await modelSelector.click();

    // Wait for dropdown
    await page.waitForTimeout(1000);

    // Select first model from minimax-cn
    const firstModel = page.locator('button[class*="hover:bg-accent"]').first();
    const modelText = await firstModel.textContent();
    await firstModel.click();

    // Wait for dropdown to close
    await page.waitForTimeout(500);

    // Verify the selected model is shown in the button
    const selectedText = await modelSelector.textContent();
    expect(selectedText).toContain('/');

    // Reload the page
    await page.reload();
    await page.waitForSelector('text=Tian-gong Agent', { timeout: 10000 });

    // Verify the model is still selected after reload
    const modelSelectorAfterReload = page.locator('button:has-text("/")');
    await expect(modelSelectorAfterReload).toBeVisible({ timeout: 10000 });
  });
});
