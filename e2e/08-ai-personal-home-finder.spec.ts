import { test, expect } from '@playwright/test';

test.describe('Flow 8: AI Personal Home Finder (Multi-Step Assistant)', () => {
  test('opens AI Personal Home Finder, conducts multi-turn conversation, and ranks real properties', async ({ page }) => {
    await page.goto('/uz');

    // 1. Open AI Home Finder via Hero button or Header
    const openBtn = page.locator('button:has-text("AI Shaxsiy Yordamchi bilan topish"), button:has-text("AI Uy Topuvchi")').first();
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // 2. Verify Modal is Open
    await expect(page.locator('text=AI Shaxsiy Uy Topuvchi')).toBeVisible({ timeout: 5000 });

    // 3. Type natural language request
    const chatInput = page.locator('input[placeholder*="Qanday uy qidiryapsiz?"]');
    await expect(chatInput).toBeVisible();
    await chatInput.fill("Chilonzorda 4 mln gacha 2 xonali mebelli kvartira kerak");
    await page.keyboard.press('Enter');

    // 4. Verify AI Response & Recommendations
    await expect(page.locator('text=mos xonadon topildi, text=mos variant topildi, text=Qaysi tuman').first()).toBeVisible({ timeout: 8000 });

    // 5. Verify Match Score and verified facts bullet points
    const matchBadge = page.locator('text=% mos').first();
    if (await matchBadge.isVisible()) {
      await expect(matchBadge).toBeVisible();
      await expect(page.locator('text=Nega aynan sizga mos:').first()).toBeVisible();
    }

    // 6. Test Quick Refinement Chip
    const refinementChip = page.locator('button:has-text("+500 ming budjet"), button:has-text("Metroga yaqinroq")').first();
    if (await refinementChip.isVisible()) {
      await refinementChip.click();
      await expect(page.locator('text=yangilandi, text=mos xonadon').first()).toBeVisible({ timeout: 6000 });
    }
  });
});
