import { test, expect } from '@playwright/test';

test.describe('Flow 5: 4-Step Listing Creation Wizard Flow', () => {
  test('navigates through all 4 wizard steps and creates listing', async ({ page }) => {
    await page.goto('/uz');

    // Click Post Listing button
    await page.click('button:has-text("E\'lon berish")');

    // Step 1: Transaction & Property Type
    await expect(page.locator('text=Bitim va Mulk turini tanlang')).toBeVisible();
    await page.click('button:has-text("Keyingi")');

    // Step 2: Location
    await expect(page.locator('text=Joylashuv ma\'lumotlari')).toBeVisible();
    await page.fill('input[placeholder*="Chilonzor 9-mavze"]', 'Chilonzor 12-mavze, 5-uy');
    await page.click('button:has-text("Keyingi")');

    // Step 3: Parameters & AI generation
    await expect(page.locator('text=Parametrlar va Tavsif')).toBeVisible();
    await page.click('button:has-text("AI yordamida yozish")');
    await page.waitForTimeout(700);

    // Title input should be populated by AI
    const titleInput = page.locator('input[placeholder*="Chilonzorda 2 xonali"]');
    await expect(titleInput).not.toBeEmpty();
    await page.click('button:has-text("Keyingi")');

    // Step 4: Price & Publish
    await expect(page.locator('text=Narx va Qulayliklar')).toBeVisible();
    await page.click('button:has-text("E\'lonni joylashtirish")');

    // Wizard should close on success
    await expect(page.locator('text=Bitim va Mulk turini tanlang')).not.toBeVisible();
  });
});
