import { test, expect } from '@playwright/test';

test.describe('Flow 7: Mobile Viewport & Responsive Layout Flow', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('verifies mobile split-toggle button and ensures zero horizontal overflow', async ({ page }) => {
    await page.goto('/uz');

    // Verify floating mobile toggle button is visible
    const toggleButton = page.locator('button:has-text("Xaritada ko\'rish"), button:has-text("Ro\'yxatni ko\'rish")');
    await expect(toggleButton).toBeVisible();

    // Click toggle to switch to Map view
    await toggleButton.click();
    await expect(page.locator('button:has-text("Ro\'yxatni ko\'rish")')).toBeVisible();

    // Click toggle to switch back to List view
    await toggleButton.click();
    await expect(page.locator('button:has-text("Xaritada ko\'rish")')).toBeVisible();

    // Verify horizontal scroll width equals client width (no horizontal overflow)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});
