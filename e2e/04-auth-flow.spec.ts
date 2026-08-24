import { test, expect } from '@playwright/test';

test.describe('Flow 4: Authentication & User Roles Flow', () => {
  test('opens phone login modal, registers as Owner, and verifies session state', async ({ page }) => {
    await page.goto('/uz');

    // Click Login button in Navbar
    await page.click('button:has-text("Kirish")');

    // Verify modal appears
    await expect(page.locator('text=Tizimga kirish')).toBeVisible();

    // Switch to Register tab
    await page.click('button:has-text("Ro\'yxatdan o\'tish")');

    // Fill form
    await page.fill('input[placeholder*="Sardor Rahimov"]', 'Dilshod Aliyev');
    await page.fill('input[placeholder*="+998"]', '+998901234567');
    await page.fill('input[placeholder="••••••••"]', 'SecretPass123!');

    // Submit form
    await page.click('button[type="submit"]:has-text("Ro\'yxatdan o\'tish")');

    // Modal should close and user initials / logout should appear
    await expect(page.locator('button:has-text("Chiqish")')).toBeVisible();

    // Click Logout
    await page.click('button:has-text("Chiqish")');
    await expect(page.locator('button:has-text("Kirish")')).toBeVisible();
  });
});
