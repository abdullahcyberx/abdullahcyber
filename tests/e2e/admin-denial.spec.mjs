import { test, expect } from '@playwright/test';

test.describe('Admin Route Access Denial', () => {
  const deniedUrl = '/not-here-boy/';
  const deniedText = 'not here boy 🙂';

  test('Denies access to /admin', async ({ page }) => {
    const response = await page.goto('/admin');
    // It should redirect to /not-here-boy/
    expect(page.url()).toContain(deniedUrl);
    await expect(page.locator('body')).toContainText(deniedText);
  });

  test('Denies access to /admin/', async ({ page }) => {
    const response = await page.goto('/admin/');
    expect(page.url()).toContain(deniedUrl);
    await expect(page.locator('body')).toContainText(deniedText);
  });

  test('Denies access to /admin/index.html', async ({ page }) => {
    const response = await page.goto('/admin/index.html');
    expect(page.url()).toContain(deniedUrl);
    await expect(page.locator('body')).toContainText(deniedText);
  });

  test('Denies access to deeper admin paths', async ({ page }) => {
    const response = await page.goto('/admin/assets/test.js');
    expect(page.url()).toContain(deniedUrl);
    await expect(page.locator('body')).toContainText(deniedText);

    const response2 = await page.goto('/admin/deeper/path/file.js');
    expect(page.url()).toContain(deniedUrl);
    await expect(page.locator('body')).toContainText(deniedText);
  });
});
