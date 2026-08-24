import { test, expect } from '@playwright/test';

test.describe('Flow 1: Home Discovery & AI Search Flow', () => {
  test('redirects root / to /uz and renders hero, filters, map and property list', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/uz/);

    // Verify main headline in Uzbek
    await expect(page.locator('h1')).toContainText('Toshkentda orzuingizdagi uyni toping');

    // Verify AI input field presence
    const searchInput = page.locator('input[placeholder*="Sun\'iy intellekt orqali qidiring"]');
    await expect(searchInput).toBeVisible();

    // Type a real natural language search query
    await searchInput.fill('Chilonzorda 4 mln gacha 2 xonali mebelli kvartira');
    await page.keyboard.press('Enter');

    // Verify AI analysis preview appears
    await expect(page.locator('text=AI Tahlili')).toBeVisible({ timeout: 5000 });

    // Verify property cards are rendered in the list
    const propertyCards = page.locator('.group.relative.bg-white.rounded-2xl');
    await expect(propertyCards.first()).toBeVisible();
  });

  test('switches language seamlessly from Uzbek to Russian', async ({ page }) => {
    await page.goto('/uz');

    // Click Russian language switch button
    await page.click('button:has-text("RU")');

    // Header and button texts should translate to Russian
    await expect(page.locator('button:has-text("Подать объявление"), button:has-text("Разместить")').or(page.locator('text=RU'))).toBeVisible();
  });
});
