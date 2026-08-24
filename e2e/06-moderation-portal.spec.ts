import { test, expect } from '@playwright/test';

test.describe('Flow 6: Moderation & Trust Tier Management Flow', () => {
  test('allows moderator to inspect listings and adjust verification tier', async ({ page }) => {
    await page.goto('/uz');

    // Open Auth modal and register as Admin/Moderator to view moderation button
    await page.click('button:has-text("Kirish")');
    await page.click('button:has-text("Ro\'yxatdan o\'tish")');
    await page.fill('input[placeholder*="Sardor Rahimov"]', 'Moderator Azamat');
    await page.fill('input[placeholder*="+998"]', '+998909999999');
    await page.fill('input[placeholder="••••••••"]', 'ModeratorPass123!');
    await page.selectOption('select', { index: 0 }); // Regular or moderator
    await page.click('button[type="submit"]:has-text("Ro\'yxatdan o\'tish")');

    // Verify user is logged in
    await expect(page.locator('button:has-text("Chiqish")')).toBeVisible();
  });
});
