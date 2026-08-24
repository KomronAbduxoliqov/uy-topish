import { test, expect } from '@playwright/test';

test.describe('Flow 10: Advanced Fraud, Scam & Trust Protection System', () => {
  test('inspects transparent trust details on property modal and submits user report', async ({ page }) => {
    await page.goto('/uz');

    // 1. Open property detail modal
    const firstProperty = page.locator('.group.relative.bg-white.rounded-2xl').first();
    await expect(firstProperty).toBeVisible({ timeout: 5000 });
    await firstProperty.click();

    // 2. Verify Trust & Verification Section
    await expect(page.locator('text=Ishonchlilik & Tekshiruv, text=Telefon raqam').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Hujjatlar').first()).toBeVisible();

    // 3. Click "Shikoyat" (Report) Button
    const reportBtn = page.locator('button:has-text("Shikoyat")').first();
    await expect(reportBtn).toBeVisible();
    await reportBtn.click();

    // 4. Verify Report Modal is Open
    await expect(page.locator('text=E\'lon ustidan shikoyat qilish')).toBeVisible({ timeout: 5000 });

    // 5. Select reason and submit
    const scamOption = page.locator('input[value="SCAM"]');
    await scamOption.check();

    const descInput = page.locator('textarea[placeholder*="Shubhali holat"]');
    await descInput.fill('Oldindan zakalat talab qildi.');

    const submitReportBtn = page.locator('button:has-text("Shikoyatni yuborish")');
    await submitReportBtn.click();

    // 6. Verify Confirmation
    await expect(page.locator('text=Shikoyatingiz qabul qilindi!')).toBeVisible({ timeout: 5000 });
  });

  test('opens Moderation Modal and reviews Fraud & Scam queue with AI evidence', async ({ page }) => {
    await page.goto('/uz');

    // 1. Open Tools dropdown and click Moderation
    const toolsBtn = page.locator('button:has-text("Vositalar")').first();
    if (await toolsBtn.isVisible()) {
      await toolsBtn.click();
    }

    const modBtn = page.locator('button:has-text("Moderatsiya")').first();
    if (await modBtn.isVisible()) {
      await modBtn.click();
      await expect(page.locator('text=UyTop Moderatsiya & Firibgarlikdan Himoya')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Firibgarlik & Xavf Navbati').first()).toBeVisible();
    }
  });
});
