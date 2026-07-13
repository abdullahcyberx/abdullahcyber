import { test, expect } from '@playwright/test';

test.describe('Portfolio Smoke Tests', () => {
  test('Homepage loads without console errors, CSP issues, or failed requests', async ({ page }) => {
    const errors = [];
    const failedRequests = [];
    
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('requestfailed', request => failedRequests.push(request.url()));
    page.on('response', response => {
      if (response.status() >= 400) failedRequests.push(response.url());
    });

    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    expect(errors.length).toBe(0);
    expect(failedRequests.length).toBe(0);

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBeFalsy();

    const html = await page.content();
    expect(html).not.toMatch(/\{\{\s*[^}]+\s*\}\}/);

    await expect(page.locator(".hero-name-primary")).toBeVisible();
    await expect(page.locator(".hero-name-accent")).toBeVisible();
  });

  test('Skip link accessibility', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('.skip-link');
    
    // Evaluate matrix to check if it's visually hidden (Y translation < 0)
    const isHidden = await skipLink.evaluate(node => {
      const transform = window.getComputedStyle(node).transform;
      if (transform === 'none') return false;
      const m = transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^)]+)\)/);
      return m && parseFloat(m[1]) < 0;
    });
    expect(isHidden).toBe(true);

    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await page.waitForTimeout(300); // Wait for CSS transition
    
    const isVisible = await skipLink.evaluate(node => {
      const transform = window.getComputedStyle(node).transform;
      if (transform === 'none') return true;
      const m = transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^)]+)\)/);
      return !m || parseFloat(m[1]) === 0;
    });
    expect(isVisible).toBe(true);
  });

  test('Project hover creates no failed requests', async ({ page }) => {
    const failedRequests = [];
    page.on('requestfailed', request => failedRequests.push(request.url()));
    page.on('response', response => {
      if (response.status() >= 400) failedRequests.push(response.url());
    });

    await page.goto('/');
    const projectRows = page.locator('.project-row');
    const count = await projectRows.count();
    
    for (let i = 0; i < count; i++) {
      await projectRows.nth(i).hover();
      await page.waitForTimeout(100);
    }
    
    expect(failedRequests.length).toBe(0);
  });

  test('Mobile menu interactions and accessibility', async ({ page, isMobile }) => {
    await page.goto('/');
    
    if (isMobile) {
      const menuTrigger = page.locator('#mobile-menu-trigger');
      const mobileMenu = page.locator('#mobile-menu');
      
      await menuTrigger.click();
      await expect(mobileMenu).toHaveClass(/open/);
      await expect(menuTrigger).toHaveAttribute('aria-expanded', 'true');
      await expect(mobileMenu).toHaveAttribute('aria-hidden', 'false');
      
      await page.keyboard.press('Escape');
      await expect(mobileMenu).not.toHaveClass(/open/);
      await expect(menuTrigger).toBeFocused();
      
      await menuTrigger.click();
      await expect(mobileMenu).toHaveClass(/open/);
      
      const navLinks = mobileMenu.locator('a');
      if (await navLinks.count() > 0) {
        await navLinks.first().click();
        await expect(mobileMenu).not.toHaveClass(/open/);
      }
    }
  });

  test('Interactive elements (Skills, Modal, AI)', async ({ page }) => {
    await page.goto('/');
    
    const skillKeys = page.locator('.skill-key');
    if (await skillKeys.count() > 0) {
      await skillKeys.first().hover();
      await expect(skillKeys.first()).toHaveClass(/active/);
    }
    
    const aiToggle = page.locator('.ai-toggle');
    const aiAssistant = page.locator('#ai-assistant');
    if (await aiToggle.count() > 0) {
      await aiToggle.click();
      await expect(aiAssistant).toHaveClass(/open/);
      
      const closeAi = page.locator('[data-ai-close]');
      await closeAi.click();
      await expect(aiAssistant).not.toHaveClass(/open/);
    }
    
    const projectModalTrigger = page.locator('[data-modal]').first();
    const caseModal = page.locator('#case-modal');
    if (await projectModalTrigger.count() > 0) {
      await projectModalTrigger.click();
      await expect(caseModal).toHaveAttribute('open', '');
      
      const closeModal = page.locator('.modal-close');
      await closeModal.click();
      await expect(caseModal).not.toHaveAttribute('open');
    }
  });

  test('Verify Certificates and CV Links', async ({ page }) => {
    await page.goto('/');
    const certLinks = page.locator('.cert-card a, .supp-cert-row a');
    const count = await certLinks.count();
    
    for (let i = 0; i < count; i++) {
      const href = await certLinks.nth(i).getAttribute('href');
      expect(href).not.toBeNull();
      const res = await page.request.get(href);
      expect(res.status()).toBe(200);
    }
  });
});
