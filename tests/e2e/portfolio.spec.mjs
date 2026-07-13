import { test, expect } from '@playwright/test';

test.describe('Portfolio Functionality', () => {
  test('homepage loads without console errors or overflow', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    
    await page.goto('/');
    await expect(page).toHaveTitle(/Abdullah Cyber/);
    
    expect(errors.length).toBe(0);
    
    // Check for horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBeFalsy();
  });

  test('desktop navigation and command palette work', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop only test');
    await page.goto('/');
    
    const moreMenu = page.locator('#nav-more-menu');
    await expect(moreMenu).toBeHidden();
    await page.click('#nav-more-toggle');
    // Wait for animation or visibility
    await expect(moreMenu).toBeVisible();

    await page.keyboard.press('Control+k');
    const commandPalette = page.locator('.command-palette');
    await expect(commandPalette).toBeVisible();
  });

  test('desktop keyboard interaction works', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop only test');
    await page.goto('/');
    await page.locator('#keyboard-board').scrollIntoViewIfNeeded();
    const key = page.locator('.skill-key[data-skill="burp"]');
    await key.click();
    await expect(page.locator('#skill-title')).toContainText(/Burp/i);
  });

  test('project modals open and close', async ({ page }) => {
    await page.goto('/');
    const projectLink = page.locator('.project-link').first();
    await projectLink.scrollIntoViewIfNeeded();
    await projectLink.click();
    
    const modal = page.locator('.case-modal[open]');
    await expect(modal).toBeVisible();
    await modal.locator('.modal-close').click();
    await expect(modal).toBeHidden();
  });

  test('AI uses correct name and fallback', async ({ page }) => {
    await page.goto('/');
    
    // Check no Orbit AI text exists
    const pageContent = await page.content();
    expect(pageContent).not.toMatch(/Orbit AI/i);

    const aiTrigger = page.locator('.nav-ai-trigger').first();
    if (await aiTrigger.isVisible()) {
      await aiTrigger.click();
      await expect(page.locator('.ai-panel')).toBeVisible();
      
      const input = page.locator('.ai-input');
      if (await input.isVisible()) {
        await input.fill('What is your name?');
        await page.keyboard.press('Enter');
        await expect(page.locator('[role="log"]')).toContainText(/I am Shehzada.*AI/i);
        
        await input.fill('Random unknown question 123');
        await page.keyboard.press('Enter');
        await expect(page.locator('[role="log"]')).toContainText(/I don't have information|I could not verify/i);
      }
    }
  });

  test('SEO metadata and canonical domain', async ({ page }) => {
    await page.goto('/');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe('https://abdullahcyber.dev/');
    
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toContain('Abdullah Cyber');
  });
});
