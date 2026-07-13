import { test, expect } from '@playwright/test';

test.describe('Portfolio Smoke Tests', () => {
  test('Homepage loads without console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Check homepage
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    expect(errors.length).toBe(0); // No console errors

    // Check horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBeFalsy();

    // Check for unresolved template variables
    const html = await page.content();
    expect(html).not.toMatch(/\{\{\s*[^}]+\s*\}\}/);
  });

  test('Check navigation and interactive elements', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      // Mobile header actions
      const mobileActions = page.locator('.mobile-actions');
      await expect(mobileActions).toBeVisible();

      // Ensure old mobile dock is gone
      const oldDock = page.locator('.mobile-dock');
      await expect(oldDock).toHaveCount(0);
    } else {
      // Desktop nav
      const desktopNav = page.locator('.desktop-nav');
      await expect(desktopNav).toBeVisible();
    }

    // Skills keyboard
    const keyboard = page.locator('#keyboard-board');
    await expect(keyboard).toBeVisible();

    // Shehzada's AI
    const aiTrigger = isMobile ? page.locator('.mobile-ai-trigger') : page.locator('.nav-ai-icon');
    await expect(aiTrigger).toBeVisible();
    
    // Project Modals
    const projectBtn = page.locator('button.project-link').first();
    if (await projectBtn.count() > 0) {
      await expect(projectBtn).toBeVisible();
    }
  });

  test('Verify Certificates and CV Links', async ({ page }) => {
    await page.goto('/');
    
    // Certificates
    const certLinks = page.locator('.cert-card, .mini-cert');
    const count = await certLinks.count();
    
    for (let i = 0; i < count; i++) {
      const href = await certLinks.nth(i).getAttribute('href');
      expect(href).not.toBeNull();
      
      // We don't click it to avoid opening PDFs in browser during tests, 
      // but we can request it
      const res = await page.request.get(href);
      expect(res.status()).toBe(200);
    }
  });
});
