import { test, expect } from '@playwright/test';

test.describe('Flow 3: Property Details & SEO Route Flow', () => {
  test('opens dynamic property route and verifies details, metadata, and JSON-LD', async ({ page }) => {
    const testPropertyId = '11111111-1111-1111-1111-111111111101';
    await page.goto(`/uz/properties/${testPropertyId}`);

    // Verify page title / heading
    await expect(page.locator('h1')).toBeVisible();

    // Verify price in UZS is rendered
    await expect(page.locator('text=so\'m')).toBeVisible();

    // Verify metro badge
    await expect(page.locator('text=metrosi')).toBeVisible();

    // Verify structured JSON-LD in DOM
    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toBeAttached();

    const jsonContent = await jsonLdScript.textContent();
    expect(jsonContent).toContain('"@type":"RealEstateListing"');
    expect(jsonContent).toContain('"priceCurrency":"UZS"');

    // Verify owner call action button
    const phoneButton = page.locator('a[href^="tel:"]');
    await expect(phoneButton).toBeVisible();

    // Verify Telegram direct action button
    const telegramButton = page.locator('a[href^="https://t.me/"]');
    await expect(telegramButton).toBeVisible();
  });
});
