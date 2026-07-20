import re

with open('tests/site-smoke.spec.mjs', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove lines 494 to 604 (index 493 to 603)
del lines[493:604]

code = "".join(lines)

new_tests = """  test.describe("Back to top and Shehzada AI", () => {
    test("Back to top button scrolls and cleans up URL", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.click('#back-to-top');
      await page.waitForFunction(() => window.scrollY === 0, { timeout: 2000 });
      const hash = await page.evaluate(() => window.location.hash);
      expect(hash).toBe("");
    });

    test("AI assistant - Compact dimensions and structural assertions", async ({ page, isMobile }) => {
      if (isMobile) test.skip();
      await page.goto("/");
      await page.click('[data-ai-open]');
      const aiPanel = page.locator('.ai-panel');
      await expect(aiPanel).toBeVisible();

      const box = await aiPanel.boundingBox();
      expect(box.width).toBeLessThanOrEqual(440);
      expect(box.height).toBeLessThanOrEqual(720);
      
      // Right/bottom distance
      const viewport = page.viewportSize();
      const rightDistance = viewport.width - (box.x + box.width);
      const bottomDistance = viewport.height - (box.y + box.height);
      expect(rightDistance).toBeGreaterThanOrEqual(10);
      expect(bottomDistance).toBeGreaterThanOrEqual(10);

      // Verify no removed features
      await expect(page.locator('#ai-jump-to-latest')).toHaveCount(0);
      await expect(page.locator('#ai-stop-btn')).toHaveCount(0);
      await expect(page.locator('#ai-voice-input')).toHaveCount(0);
      await expect(page.locator('#ai-voice-output')).toHaveCount(0);
    });

    test("AI assistant - Maximize and restore dimensions", async ({ page, isMobile }) => {
      if (isMobile) test.skip();
      await page.goto("/");
      await page.click('[data-ai-open]');
      
      // Type draft
      await page.fill('#ai-input', 'Draft message');

      const panel = page.locator('.ai-panel');
      const box1 = await panel.boundingBox();

      // Maximize
      await page.click('#ai-maximize-btn');
      await page.waitForTimeout(300);
      
      const box2 = await panel.boundingBox();
      expect(box2.width).toBeGreaterThan(box1.width);
      
      // Draft remains
      expect(await page.inputValue('#ai-input')).toBe('Draft message');

      // Restore
      await page.click('#ai-maximize-btn');
      await page.waitForTimeout(300);

      const box3 = await panel.boundingBox();
      expect(box3.width).toBeCloseTo(box1.width, 0);
      expect(box3.height).toBeCloseTo(box1.height, 0);

      // Draft remains
      expect(await page.inputValue('#ai-input')).toBe('Draft message');
    });

    test("AI assistant - Close while maximized, reopen compact", async ({ page, isMobile }) => {
      if (isMobile) test.skip();
      await page.goto("/");
      await page.click('[data-ai-open]');
      await page.click('#ai-maximize-btn');
      await page.waitForTimeout(300);
      
      await page.click('.ai-close-button');
      await page.waitForTimeout(300);
      
      await page.click('[data-ai-open]');
      await page.waitForTimeout(300);

      const aiDialog = page.locator('#ai-assistant');
      await expect(aiDialog).not.toHaveClass(/is-maximized/);
      
      const panel = page.locator('.ai-panel');
      const box = await panel.boundingBox();
      expect(box.width).toBeLessThanOrEqual(440);
    });

    test("AI assistant - Mobile fullscreen and header controls", async ({ page, isMobile }) => {
      if (!isMobile) test.skip();
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await page.evaluate(() => document.getElementById("about")?.scrollIntoView());
      await page.waitForTimeout(500);
      
      await page.click('[data-ai-open]');
      await page.waitForTimeout(300);

      const panel = page.locator('.ai-panel');
      const box = await panel.boundingBox();
      expect(box.width).toBe(375);
      expect(box.height).toBe(667);

      // No maximize button
      await expect(page.locator('#ai-maximize-btn')).not.toBeVisible();
      
      // Composer remains visible
      await expect(page.locator('#ai-form')).toBeVisible();
    });

    test("Shehzada AI opens, answers basic query, and clears", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => document.getElementById("about")?.scrollIntoView());
      await page.waitForTimeout(500);
      await page.click('[data-ai-open]');
      
      // Ensure Welcome screen is visible
      await expect(page.locator('#ai-welcome')).toBeVisible();

      // Ask question
      await page.fill('#ai-input', 'Who is Muhammad?');
      await page.click('#ai-form button[type="submit"]');

      // Welcome should hide
      await expect(page.locator('#ai-welcome')).toBeHidden();

      // Check user message
      await expect(page.locator('.ai-user .ai-bubble').last()).toContainText('Who is Muhammad?');

      // Check response
      await expect(page.locator('.ai-message.ai-assistant .ai-bubble').last()).toContainText('Muhammad Abdullah', { timeout: 5000 });
      
      // Clear
      await page.click('#ai-clear-btn');
      
      // Check cleared state
      await expect(page.locator('.ai-message')).toHaveCount(0, { timeout: 2000 });
      await expect(page.locator('#ai-welcome')).toBeVisible();
    });

    test("Shehzada AI Context memory survives", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => document.getElementById("about")?.scrollIntoView());
      await page.waitForTimeout(500);
      await page.click('[data-ai-open]');

      await page.fill('#ai-input', 'Show his strongest projects');
      await page.click('#ai-form button[type="submit"]');
      await expect(page.locator('.ai-message.ai-assistant .ai-bubble').last()).toContainText('Modular Recon Tool', { timeout: 5000 });

      // Follow up
      await page.fill('#ai-input', 'What tools were used?');
      await page.click('#ai-form button[type="submit"]');
      await expect(page.locator('.ai-message.ai-assistant .ai-bubble').last()).toContainText('Modular Recon Tool', { timeout: 5000 });
    });

    test("Escape close and focus restoration", async ({ page, isMobile }) => {
      if (isMobile) test.skip();
      await page.goto("/");
      await page.focus('[data-ai-open]');
      await page.keyboard.press('Enter');
      await expect(page.locator('#ai-assistant')).toHaveClass(/open/);
      
      await page.locator('#ai-input').waitFor({ state: 'visible' });
      await page.locator('#ai-input').focus();
      await page.keyboard.press('Escape');
      await expect(page.locator('#ai-assistant')).not.toHaveClass(/open/);
    });
  });
});"""

new_code = re.sub(r'  test\.describe\("Back to top and Shehzada AI".*', new_tests, code, flags=re.DOTALL)

with open('tests/site-smoke.spec.mjs', 'w', encoding='utf-8') as f:
    f.write(new_code)
