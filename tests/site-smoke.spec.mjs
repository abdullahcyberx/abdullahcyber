import { test, expect } from "@playwright/test";

test.describe("Portfolio Smoke Tests", () => {
  test("Homepage loads without console errors, CSP issues, or failed requests", async ({
    page,
  }) => {
    const errors = [];
    const failedRequests = [];

    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("requestfailed", (request) => failedRequests.push(request.url()));
    page.on("response", (response) => {
      if (response.status() >= 400) failedRequests.push(response.url());
    });

    const response = await page.goto("/");
    expect(response.status()).toBe(200);
    expect(errors.length).toBe(0);
    expect(failedRequests.length).toBe(0);

    const overflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });
    expect(overflow).toBeFalsy();

    const html = await page.content();
    expect(html).not.toMatch(/\{\{\s*[^}]+\s*\}\}/);
  });

  test("Hero visibility and composition", async ({ page }) => {
    await page.goto("/");

    // Wait for the hero animation to complete
    await page.waitForTimeout(1200);

    const title = page.locator(".hero-title");
    await expect(title).toBeVisible();

    const opacity = await title.evaluate(
      (element) => getComputedStyle(element).opacity,
    );
    expect(Number(opacity)).toBeGreaterThan(0.95);

    const namePrimary = page.locator(".hero-name-primary");
    const primaryColor = await namePrimary.evaluate(
      (el) => getComputedStyle(el).color,
    );
    // rgba(244, 244, 244) or rgb(244, 244, 244)
    expect(primaryColor).toContain("rgb(244, 243, 238)");

    const nameAccent = page.locator(".hero-name-accent");
    const accentColor = await nameAccent.evaluate(
      (el) => getComputedStyle(el).color,
    );
    expect(accentColor).toContain("rgba(244, 243, 238, 0.58)");

    const statement = page.locator(".hero-statement");
    await expect(statement).toBeVisible();

    const actions = page.locator(".hero-actions .btn").first();
    await expect(actions).toBeVisible();
  });

  test("Project action button styling", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1200);

    const projectRow = page.locator(".project-row").first();
    const projectLink = projectRow.locator(".project-link").first();

    const linkWidth = await projectLink.evaluate(
      (el) => el.getBoundingClientRect().width,
    );
    const rowWidth = await projectRow.evaluate(
      (el) => el.getBoundingClientRect().width,
    );

    expect(linkWidth).toBeLessThan(rowWidth * 0.5);
  });

  test("Skip link accessibility", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator(".skip-link");

    // Evaluate matrix to check if it's visually hidden (Y translation < 0)
    const isHidden = await skipLink.evaluate((node) => {
      const transform = window.getComputedStyle(node).transform;
      if (transform === "none") return false;
      const m = transform.match(
        /matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^)]+)\)/,
      );
      return m && parseFloat(m[1]) < 0;
    });
    expect(isHidden).toBe(true);

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await page.waitForTimeout(300); // Wait for CSS transition

    const isVisible = await skipLink.evaluate((node) => {
      const transform = window.getComputedStyle(node).transform;
      if (transform === "none") return true;
      const m = transform.match(
        /matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^)]+)\)/,
      );
      return !m || parseFloat(m[1]) === 0;
    });
    expect(isVisible).toBe(true);
  });

  test("Mobile menu interactions and accessibility", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) {
      await page.goto("/");

      const menuTrigger = page.locator("#mobile-menu-trigger");
      const mobileMenu = page.locator("#mobile-menu");

      await menuTrigger.click();
      await expect(mobileMenu).toHaveClass(/open/);
      await expect(menuTrigger).toHaveAttribute("aria-expanded", "true");
      await expect(mobileMenu).toHaveAttribute("aria-hidden", "false");

      await page.keyboard.press("Escape");
      await expect(mobileMenu).not.toHaveClass(/open/);
      await expect(menuTrigger).toBeFocused();

      await menuTrigger.click();
      await expect(mobileMenu).toHaveClass(/open/);

      const navLinks = mobileMenu.locator("a");
      if ((await navLinks.count()) > 0) {
        await navLinks.first().click();
        await expect(mobileMenu).not.toHaveClass(/open/);
      }
    }
  });

  test("Interactive elements (Skills, Modal)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    const skillKeys = page.locator(".skill-key");
    if ((await skillKeys.count()) > 0) {
      await skillKeys.first().hover();
      await expect(skillKeys.first()).toHaveClass(/active/);
    }

    const projectModalTrigger = page.locator("[data-modal]").first();
    const caseModal = page.locator("#case-modal");
    if ((await projectModalTrigger.count()) > 0) {
      await projectModalTrigger.click();
      await expect(caseModal).toHaveAttribute("open", "");

      const closeModal = page.locator(".modal-close");
      await closeModal.click();
      await expect(caseModal).not.toHaveAttribute("open");
    }
  });

  test("Shehzadas AI advanced features", async ({ page, context }) => {
    // Grant clipboard permissions for copy testing
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/");

    const aiToggle = page.locator("[data-ai-open]").first();
    await aiToggle.click();
    const aiAssistant = page.locator("#ai-assistant");
    await expect(aiAssistant).toHaveClass(/open/);

    const messages = page.locator(".ai-messages");

    // Recruiter briefing & copy
    const briefChip = page.locator('[data-ai-special="brief"]').first();
    await briefChip.click();
    await page.waitForTimeout(500);
    await expect(messages).toContainText("Recruiter Briefing");

    const copyBtn = page.locator('[data-ai-special="copy-brief"]').first();
    await copyBtn.click();
    await page.waitForTimeout(300);

    // Evidence scan
    const scanChip = page.locator('[data-ai-special="scan"]').first();
    await scanChip.click();
    await page.waitForTimeout(1200);
    await expect(messages).toContainText('Evidence Scan');
    await expect(messages).toContainText("Found");

    // CTF challenge
    const ctfChip = page.locator('[data-ai-special="challenge"]').first();
    await ctfChip.click();
    await page.waitForTimeout(1000); // Wait for title and first question to appear

    const input = page.locator("#ai-input");

    // Incorrect answer
    await input.fill("wrong answer");
    await input.press("Enter");
    await page.waitForTimeout(500);
    await expect(messages).toContainText("Not quite. Try again");

    // Hint
    const hintChip = page.locator('[data-ai-special="hint"]').first();
    await hintChip.click();
    await page.waitForTimeout(500);
    await expect(messages).toContainText("Think about input being inserted");

    // First correct answer
    await input.fill("sql injection");
    await input.press("Enter");
    await page.waitForTimeout(500);
    await expect(messages).toContainText(
      "I execute untrusted script inside another visitor",
    );

    // Second correct answer
    await input.fill("xss");
    await input.press("Enter");
    await page.waitForTimeout(500);
    await expect(messages).toContainText(
      "Challenge complete. You identified both",
    );
    await expect(messages).toContainText("FLAG{think_beyond_tools}");
  });

  test("Shehzadas AI accessibility", async ({ page }) => {
    await page.goto("/");

    const aiToggle = page.locator("[data-ai-open]").first();
    await aiToggle.focus();
    await aiToggle.press("Enter");

    const aiAssistant = page.locator("#ai-assistant");
    await expect(aiAssistant).toHaveClass(/open/);
    await expect(page.locator("body")).toHaveClass(/ai-open/);

    const input = page.locator("#ai-input");
    await expect(input).toBeFocused();

    // Tab trap
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(input).toBeFocused();

    // Voice APIs gracefully hidden if unsupported in playwright
    const voiceInput = page.locator("#ai-voice-input");
    const voiceOutput = page.locator("#ai-voice-output");
    expect(await voiceInput.count()).toBe(1);

    // Escape closes panel and restores focus
    await page.keyboard.press("Escape");
    await expect(aiAssistant).not.toHaveClass(/open/);
    await expect(page.locator("body")).not.toHaveClass(/ai-open/);

    // Focus should be restored
    await expect(aiToggle).toBeFocused();
  });
});
