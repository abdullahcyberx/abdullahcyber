import { test, expect } from '@playwright/test';

test.describe('Manager Smoke Tests', () => {
  test('Manager UI interacts correctly', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop', 'Manager is a desktop-only tool');
    
    await page.goto('/local-tools/portfolio-manager.html');

    // 1. Initial Load & Import
    await expect(page.locator('h2:has-text("Portfolio Manager")')).toBeVisible();
    
    // Upload content/certificates.json
    await page.setInputFiles('#file-input', 'content/certificates.json');
    await expect(page.locator('#loaded-status')).toContainText('Loaded certificates.json');

    // Verify tabs
    await page.click('button:has-text("Certificates")');
    await expect(page.locator('h1:has-text("Certificates")')).toBeVisible();

    // 2. Add/Edit a certificate
    page.on('dialog', dialog => dialog.accept()); // Accept any alerts/confirms

    await page.click('button:has-text("Add New")');
    await expect(page.locator('#editor-title')).toContainText('Add New certificates');

    // Invalid URL and Extension rejection test
    await page.fill('#edit-certificateFile', '/assets/invalid.txt');
    await page.fill('#edit-verificationUrl', 'invalid-url');
    
    // Save should trigger an alert but we accepted it, wait the editor shouldn't close if it failed
    await page.click('button:has-text("Save to Memory")');
    // It should still be active because validation failed
    await expect(page.locator('.editor-modal.active')).toBeVisible();
    
    // Fix it
    await page.fill('#edit-certificateFile', '/assets/certificates/test.pdf');
    await page.fill('#edit-verificationUrl', 'https://example.com');
    await page.fill('#edit-title', 'Playwright Certificate');
    await page.check('#edit-featured');
    await page.click('button:has-text("Save to Memory")');

    // Editor should close
    await expect(page.locator('.editor-modal.active')).not.toBeVisible();
    
    // Should be in the list
    await expect(page.locator('h3:has-text("Playwright Certificate")')).toBeVisible();

    // 3. Search and Filter
    await page.fill('#search-certificates', 'Playwright');
    await page.press('#search-certificates', 'Enter');
    await expect(page.locator('#list-container-certificates .list-item')).toHaveCount(1);
    
    await page.check('#filter-feat-certificates');
    await expect(page.locator('#list-container-certificates .list-item')).toHaveCount(1); // It is featured

    // 4. Duplicate
    await page.click('button:has-text("Duplicate")');
    await expect(page.locator('h3:has-text("Playwright Certificate")')).toHaveCount(2);

    // 5. Delete
    await page.click('#list-container-certificates .list-item:nth-child(1) button:has-text("Delete")');
    await expect(page.locator('#list-container-certificates .list-item')).toHaveCount(1);
    
    // 6. Unsaved changes warning
    const unsavedBanner = page.locator('#unsaved-banner');
    await expect(unsavedBanner).toBeVisible();

    // 7. Check export buttons exist on Import/Export tab
    await page.click('button:has-text("Import / Export")');
    await expect(page.locator('button:has-text("Download Combined Backup")')).toBeVisible();
    await expect(page.locator('button:has-text("Download Individual JSONs")')).toBeVisible();
  });
});
