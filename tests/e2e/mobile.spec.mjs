import { test, expect } from '@playwright/test';

test.describe('Mobile Functionality', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('mobile bottom navigation and sheet work', async ({ page }) => {
    await page.goto('/');
    
    // Bottom dock visibility
    const dock = page.locator('.mobile-dock');
    await expect(dock).toBeVisible();

    // Open more sheet
    const moreBtn = page.locator('.mobile-dock-more');
    if (await moreBtn.isVisible()) {
      await moreBtn.click();
      const sheet = page.locator('.mobile-more-sheet');
      await expect(sheet).toBeVisible();
      
      // Close sheet
      await page.locator('.sheet-close').click();
      await expect(sheet).not.toBeVisible();
    }
  });

  test('mobile skills keyboard fits and is clickable', async ({ page }) => {
    await page.goto('/');
    
    const board = page.locator('#keyboard-board');
    await expect(board).toBeVisible();
    
    // Check it doesn't overflow horizontally
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBeFalsy();

    // Click a key
    const key = page.locator('.skill-key').first();
    await key.click();
    await expect(page.locator('.skill-display')).toBeVisible();
  });
});
