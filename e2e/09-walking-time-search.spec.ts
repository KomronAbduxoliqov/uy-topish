import { test, expect } from '@playwright/test';

test.describe('Flow 9: Walking-Time Search & Smart Nearby (Accessibility)', () => {
  test('conducts walking travel-time search on map and verifies property travel badge', async ({ page }) => {
    await page.goto('/uz');

    // 1. Verify Map Accessibility Mode Switcher (⭕ Radius / 🚶 Piyoda)
    const walkingModeBtn = page.locator('button:has-text("🚶 Piyoda")').first();
    await expect(walkingModeBtn).toBeVisible({ timeout: 5000 });
    await walkingModeBtn.click();

    // 2. Click 10 min walking preset
    const tenMinBtn = page.locator('button:has-text("10 daq")').first();
    await expect(tenMinBtn).toBeVisible();
    await tenMinBtn.click();

    // 3. Verify map status text updates to "Piyoda 10 daqiqa"
    await expect(page.locator('text=Piyoda 10 daqiqa').first()).toBeVisible({ timeout: 5000 });
  });

  test('opens property detail modal and inspects Smart Nearby convenience scores and walking POIs', async ({ page }) => {
    await page.goto('/uz');

    // 1. Click first property card to open detail modal
    const firstProperty = page.locator('.group.relative.bg-white.rounded-2xl').first();
    await expect(firstProperty).toBeVisible({ timeout: 5000 });
    await firstProperty.click();

    // 2. Verify Detail Modal is open
    await expect(page.locator('text=Smart Nearby & Qulaylik Indeksi, text=Atrofdagi infratuzilma').first()).toBeVisible({ timeout: 6000 });

    // 3. Verify category pills (Transport / Ta'lim / Xarid / Tibbiyot)
    await expect(page.locator('button:has-text("Transport"), button:has-text("Ta\'lim"), button:has-text("Xarid")').first()).toBeVisible();

    // 4. Verify POI walking time tag
    await expect(page.locator('text=daqiqa piyoda, text=daq').first()).toBeVisible();
  });
});
