import { test, expect } from '@playwright/test';

test.describe('Flow 2: Yandex Map & Dynamic Radius Search Flow', () => {
  test('initializes map container and displays floating radius selection toolbar', async ({ page }) => {
    await page.goto('/uz');

    // Radius toolbar should be visible
    await expect(page.locator('text=Radius orqali qidiruv')).toBeVisible();

    // Verify radius buttons (500m, 1km, 2km, 5km)
    const radius1km = page.locator('button:has-text("1km")');
    await expect(radius1km).toBeVisible();

    // Click 1km radius
    await radius1km.click();

    // Reset radius button should become visible
    await expect(page.locator('button:has-text("Radiusni bekor qilish")')).toBeVisible();

    // Cancel radius selection
    await page.click('button:has-text("Radiusni bekor qilish")');
    await expect(page.locator('button:has-text("Radiusni bekor qilish")')).not.toBeVisible();
  });
});
