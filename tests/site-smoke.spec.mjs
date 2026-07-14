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

  test("Anchor navigation offset", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    const sections = [
      "projects",
      "about",
      "experience",
      "credentials",
      "contact",
    ];

    for (const sectionId of sections) {
      // Find a link that targets this section
      const link = page.locator(`a[href="#${sectionId}"]`).first();
      // If it's visible (e.g. desktop nav), click it, otherwise scroll to the section programmatically to simulate anchor
      if (await link.isVisible()) {
        await link.click();
      } else {
        await page.evaluate(
          (id) => document.querySelector(`a[href="#${id}"]`).click(),
          sectionId,
        );
      }

      await page.waitForTimeout(500); // Wait for smooth scroll

      const headerBottom = await page
        .locator(".site-header")
        .evaluate((el) => el.getBoundingClientRect().bottom);
      // Contact has a different header element
      const headingSelector =
        sectionId === "contact"
          ? ".contact-hero"
          : `#${sectionId} .section-header`;
      const headingTop = await page
        .locator(headingSelector)
        .evaluate((el) => el.getBoundingClientRect().top);

      expect(headingTop).toBeGreaterThanOrEqual(headerBottom - 2); // 2px tolerance for fractional pixels
    }
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

  test("About links section", async ({ page }) => {
    await page.goto("/");

    const aboutLinksBlock = page.locator(".about-links-block");
    await expect(aboutLinksBlock).toBeVisible();
    await expect(aboutLinksBlock.locator(".eyebrow")).toHaveText(
      "Find me online",
    );

    const links = aboutLinksBlock.locator(".profile-link");
    expect(await links.count()).toBe(4);

    // Verify order
    await expect(links.nth(0).locator("strong")).toHaveText("GitHub");
    await expect(links.nth(1).locator("strong")).toHaveText("TryHackMe");
    await expect(links.nth(2).locator("strong")).toHaveText("LinkedIn");
    await expect(links.nth(3).locator("strong")).toHaveText("Personal profile");

    for (let i = 0; i < 4; i++) {
      await expect(links.nth(i)).toHaveAttribute("target", "_blank");
      await expect(links.nth(i)).toHaveAttribute("rel", "noopener noreferrer");
    }

    await expect(links.nth(0)).toHaveAttribute(
      "href",
      "https://github.com/abdullahcyberx",
    );
    await expect(links.nth(1)).toHaveAttribute(
      "href",
      "https://tryhackme.com/p/HAFIZABDULLAH",
    );
    await expect(links.nth(2)).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/abdullahcyberx/",
    );
    await expect(links.nth(3)).toHaveAttribute(
      "href",
      "https://guns.lol/abdullahcyberx",
    );
  });

  test("Contact section Gmail action", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Scroll to contact to trigger reveal
    await page.evaluate(() => {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "auto", block: "start" });
    });
    await page.waitForTimeout(1200);

    const contactLinks = page.locator("#contact a");
    expect(await contactLinks.count()).toBe(1);

    const gmailCard = page.locator(".gmail-contact");
    await expect(gmailCard).toBeVisible();

    const gmailOpacity = await gmailCard.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).opacity),
    );
    expect(gmailOpacity).toBeGreaterThanOrEqual(0.95);

    const gmailStrongColor = await gmailCard
      .locator(".gmail-contact-copy strong")
      .evaluate((el) => getComputedStyle(el).color);
    expect(gmailStrongColor).toContain("rgb(245, 245, 242)"); // #f5f5f2

    const href = await gmailCard.getAttribute("href");
    expect(href).toMatch(/^mailto:abdullahcyberx@gmail\.com/);

    await expect(gmailCard).toHaveAttribute(
      "aria-label",
      expect.stringContaining("abdullahcyberx@gmail.com"),
    );
    await expect(gmailCard.locator("strong")).toHaveText("Email Muhammad");

    const cvLink = page.locator("#contact a[download]");
    await expect(cvLink).toHaveCount(0);
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

  test("Interactive elements (Modal)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

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

    const aiToggle = page.locator(".ai-float-btn");
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
    await expect(messages).toContainText("Evidence Scan");
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

    const aiAssistant = page.locator("#ai-assistant");
    const aiToggle = page.locator(".ai-float-btn");
    const input = page.locator("#ai-input");
    const voiceInput = page.locator("#ai-voice-input");
    const voiceOutput = page.locator("#ai-voice-output");
    const sendBtn = page.locator("button[aria-label='Send message']");

    // Before opening: Verify panel is inert and not focusable
    await expect(aiAssistant).toHaveAttribute("aria-hidden", "true");
    await expect(aiAssistant).toHaveAttribute("inert", "");

    // Verify inputs cannot receive focus
    await input.focus({ force: true }).catch(() => {});
    await expect(input).not.toBeFocused();
    await voiceInput.focus({ force: true }).catch(() => {});
    await expect(voiceInput).not.toBeFocused();
    await sendBtn.focus({ force: true }).catch(() => {});
    await expect(sendBtn).not.toBeFocused();

    // Open AI panel
    await aiToggle.focus();
    await aiToggle.press("Enter");

    // After opening: Verify inert is removed
    await expect(aiAssistant).toHaveClass(/open/);
    await expect(aiAssistant).not.toHaveAttribute("inert");
    await expect(aiAssistant).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("body")).toHaveClass(/ai-open/);
    await expect(input).toBeFocused();

    // Tab trap
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(input).toBeFocused();

    // Voice APIs gracefully hidden if unsupported in playwright
    expect(await voiceInput.count()).toBe(1);

    // Escape closes panel and restores focus
    await page.keyboard.press("Escape");
    await expect(aiAssistant).not.toHaveClass(/open/);
    await expect(aiAssistant).toHaveAttribute("aria-hidden", "true");
    await expect(aiAssistant).toHaveAttribute("inert", "");
    await expect(page.locator("body")).not.toHaveClass(/ai-open/);

    // Focus should be restored
    await expect(aiToggle).toBeFocused();
  });
});
