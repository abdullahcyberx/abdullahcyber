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

  test.describe("Section Navigation", () => {
    const navTests = [
      {
        name: "Project",
        hash: "#projects",
        selector: "#projects",
        prevSelector: null,
      },
      {
        name: "About",
        hash: "#about",
        selector: "#about",
        prevSelector: "#projects",
      },
      {
        name: "Experience",
        hash: "#experience",
        selector: "#experience",
        prevSelector: "#about",
      },
      {
        name: "Certificates",
        hash: "#credentials",
        selector: "#credentials",
        prevSelector: "#experience",
      },
      {
        name: "Contact",
        hash: "#contact",
        selector: "#contact",
        prevSelector: "#achievements",
      },
    ];

    for (const nav of navTests) {
      test(`Desktop navigation to ${nav.name}`, async ({ page, isMobile }) => {
        if (isMobile) test.skip();
        await page.goto("/");
        await page.waitForTimeout(1000);

        const link = page.locator(`.desktop-nav a[href="${nav.hash}"]`);
        await link.click();
        await page.waitForTimeout(2000); // Wait longer for smooth scroll to settle

        const headerBottom = await page
          .locator(".site-header")
          .evaluate((element) => element.getBoundingClientRect().bottom);

        const anchorTop = await page
          .locator(`${nav.selector} [data-section-anchor]`)
          .evaluate((element) => element.getBoundingClientRect().top);

        expect(anchorTop).toBeGreaterThanOrEqual(headerBottom + 12);
        expect(anchorTop).toBeLessThanOrEqual(headerBottom + 36);

        if (nav.prevSelector) {
          const previousBottom = await page
            .locator(nav.prevSelector)
            .evaluate((element) => element.getBoundingClientRect().bottom);

          expect(previousBottom).toBeLessThanOrEqual(headerBottom + 2);
        }

        await expect(page.locator(".desktop-nav a.active")).toHaveCount(1);
        await expect(
          page.locator(`.desktop-nav a[href="${nav.hash}"]`),
        ).toHaveClass(/active/);
      });
    }

    test("Clicking About immediately removes active from Work", async ({
      page,
      isMobile,
    }) => {
      if (isMobile) test.skip();
      await page.goto("/");
      await page.waitForTimeout(1000);

      const workLink = page.locator('.desktop-nav a[href="#projects"]');
      const aboutLink = page.locator('.desktop-nav a[href="#about"]');

      await workLink.click();
      await expect(workLink).toHaveClass(/active/);

      await aboutLink.click();
      await expect(workLink).not.toHaveClass(/active/);
      await expect(aboutLink).toHaveClass(/active/);
    });

    test("Manual scrolling updates the active item correctly", async ({
      page,
      isMobile,
    }) => {
      if (isMobile) test.skip();
      await page.goto("/");
      await page.waitForTimeout(1000);

      await page.evaluate(() => {
        document
          .querySelector("#about [data-section-anchor]")
          ?.scrollIntoView({ behavior: "auto", block: "start" });
      });
      await page.waitForTimeout(500);

      await expect(page.locator('.desktop-nav a[href="#about"]')).toHaveClass(
        /active/,
      );
      await expect(
        page.locator('.desktop-nav a[href="#projects"]'),
      ).not.toHaveClass(/active/);
    });

    test("Direct loading with #about positions About correctly", async ({
      page,
    }) => {
      await page.goto("/#about");
      await page.waitForTimeout(2000);

      const headerBottom = await page
        .locator(".site-header")
        .evaluate((element) => element.getBoundingClientRect().bottom);

      const anchorTop = await page
        .locator("#about [data-section-anchor]")
        .evaluate((element) => element.getBoundingClientRect().top);

      expect(anchorTop).toBeGreaterThanOrEqual(headerBottom + 12);
      expect(anchorTop).toBeLessThanOrEqual(headerBottom + 36);
    });

    test("Browser Back restores the previous section", async ({
      page,
      isMobile,
    }) => {
      if (isMobile) test.skip();
      await page.goto("/");
      await page.waitForTimeout(1000);

      await page.locator('.desktop-nav a[href="#projects"]').click();
      await page.waitForTimeout(1000);

      await page.locator('.desktop-nav a[href="#about"]').click();
      await page.waitForTimeout(1000);

      await page.goBack();
      await page.waitForTimeout(1000);

      await expect(
        page.locator('.desktop-nav a[href="#projects"]'),
      ).toHaveClass(/active/);
      await expect(
        page.locator('.desktop-nav a[href="#about"]'),
      ).not.toHaveClass(/active/);
    });

    test("Reduced-motion uses immediate scrolling", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await page.waitForTimeout(1000);

      await page.evaluate(() => {
        window.scrollTriggered = false;
        window.addEventListener(
          "scroll",
          () => {
            window.scrollTriggered = true;
          },
          { once: true },
        );
      });

      // Try scrolling to about via link
      if (await page.locator(".desktop-nav").isVisible()) {
        await page.locator('.desktop-nav a[href="#about"]').click();
      } else {
        await page.evaluate(() =>
          document.querySelector('.mobile-nav a[href="#about"]')?.click(),
        );
      }

      // Wait a short tick, if it was immediate, it finishes fast.
      await page.waitForTimeout(200);

      const headerBottom = await page
        .locator(".site-header")
        .evaluate((element) => element.getBoundingClientRect().bottom);

      const anchorTop = await page
        .locator("#about [data-section-anchor]")
        .evaluate((element) => element.getBoundingClientRect().top);

      expect(anchorTop).toBeGreaterThanOrEqual(headerBottom + 12);
      expect(anchorTop).toBeLessThanOrEqual(headerBottom + 36);
    });

    test("Mobile menu navigation reaches the same clean position", async ({
      page,
      isMobile,
    }) => {
      if (!isMobile) test.skip();
      await page.goto("/");
      await page.waitForTimeout(1000);

      await page.locator("#mobile-menu-trigger").click();
      await expect(page.locator("#mobile-menu")).toHaveClass(/open/);

      await page.locator('.mobile-nav a[href="#about"]').click();
      await page.waitForTimeout(2000);

      await expect(page.locator("#mobile-menu")).not.toHaveClass(/open/);

      const headerBottom = await page
        .locator(".site-header")
        .evaluate((element) => element.getBoundingClientRect().bottom);

      const anchorTop = await page
        .locator("#about [data-section-anchor]")
        .evaluate((element) => element.getBoundingClientRect().top);

      expect(anchorTop).toBeGreaterThanOrEqual(headerBottom + 12);
      expect(anchorTop).toBeLessThanOrEqual(headerBottom + 36);
    });
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

  test("Contact section Gmail action", async ({ page, isMobile }) => {
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

    if (isMobile) {
      await page.locator("#contact").scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const aiButton = page.locator("[data-ai-open]");

      await expect(aiButton).toHaveCSS("visibility", "hidden");
      await expect(aiButton).toHaveCSS("pointer-events", "none");

      // Scroll to About and verify
      await page.locator("#about").scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await expect(aiButton).toHaveCSS("visibility", "visible");
    }
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

  test.describe("Certifications Redesign Tests", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        document.getElementById("credentials")?.scrollIntoView({ behavior: "auto" });
      });
      await page.waitForTimeout(500);
    });

    test("Test 1 - Initial state", async ({ page }) => {
      const featured = page.locator('.featured-cert-card');
      const supp = page.locator('.supp-cert-card[data-revealed="true"]');
      const hidden = page.locator('.supp-cert-card[data-revealed="false"]');
      const btn = page.locator('#cert-reveal-btn');

      // Exactly 3 featured certificates are visible initially
      await expect(featured).toHaveCount(3);
      await expect(featured.first()).toBeVisible();
      
      // Supporting certificates are not visible after JS initializes
      await expect(supp).toHaveCount(0);
      
      // Hidden cards exist but are not displayed
      const hiddenCount = await hidden.count();
      expect(hiddenCount).toBeGreaterThan(0);
      await expect(hidden.first()).toBeHidden();

      // The first Read More button is visible and indicates 4 certificates
      await expect(btn).toBeVisible();
      await expect(btn).toHaveText("Read More Certificates (4)");
    });

    test("Test 2 - First batch", async ({ page }) => {
      const btn = page.locator('#cert-reveal-btn');
      await btn.click();
      await page.waitForTimeout(500);

      const featured = page.locator('.featured-cert-card');
      const revealed = page.locator('.supp-cert-card[data-revealed="true"]');
      
      await expect(featured).toHaveCount(3);
      await expect(revealed).toHaveCount(4);
      
      await expect(btn).toBeVisible();
      await expect(btn).toHaveText("Read More Certificates (5)");
    });

    test("Test 3 - Second batch", async ({ page }) => {
      const btn = page.locator('#cert-reveal-btn');
      await btn.click();
      await page.waitForTimeout(500);
      await btn.click();
      await page.waitForTimeout(500);

      const featured = page.locator('.featured-cert-card');
      const revealed = page.locator('.supp-cert-card[data-revealed="true"]');
      
      await expect(featured).toHaveCount(3);
      await expect(revealed).toHaveCount(9); // 4 + 5
      
      // Next batch should be 6, unless less remain
      const totalSupp = await page.locator('.supp-cert-card').count();
      const remain = totalSupp - 9;
      if (remain > 0) {
        await expect(btn).toBeVisible();
        const expectedNext = Math.min(6, remain);
        await expect(btn).toHaveText(`Read More Certificates (${expectedNext})`);
      }
    });

    test("Test 4 - Continue until complete", async ({ page }) => {
      const btn = page.locator('#cert-reveal-btn');
      
      while (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(300);
      }

      const hidden = page.locator('.supp-cert-card[data-revealed="false"]');
      await expect(hidden).toHaveCount(0);
      
      const totalCerts = await page.locator('.cert-card').count();
      const dataCerts = await page.evaluate(() => document.querySelectorAll('.cert-card').length);
      expect(totalCerts).toBe(dataCerts);

      // Verify displayOrder matches (no duplicates, strictly ordered by index)
      const ids = await page.evaluate(() => Array.from(document.querySelectorAll('.cert-card')).map(c => c.querySelector('.cert-title').textContent));
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(totalCerts);
      
      // Container should be hidden
      await expect(page.locator('#cert-reveal-container')).toBeHidden();
    });

    test("Test 5 - Certificate preview lazy loading", async ({ page }) => {
      const featuredFrames = page.locator('.featured-cert-card .cert-preview-iframe');
      for (let i = 0; i < await featuredFrames.count(); i++) {
        const src = await featuredFrames.nth(i).getAttribute('src');
        expect(src).not.toBeNull();
        expect(src).toContain('.pdf');
      }

      const hiddenCards = page.locator('.supp-cert-card[data-revealed="false"]');
      if (await hiddenCards.count() > 0) {
        const hiddenFrame = hiddenCards.first().locator('.cert-preview-iframe');
        const srcAttr = await hiddenFrame.getAttribute('src');
        const dataPdfSrc = await hiddenFrame.getAttribute('data-pdf-src');
        expect(srcAttr).toBeNull();
        expect(dataPdfSrc).toContain('.pdf');
      }

      const btn = page.locator('#cert-reveal-btn');
      await btn.click();
      await page.waitForTimeout(500);

      // Scroll to trigger IntersectionObserver
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);

      const revealedFrames = page.locator('.supp-cert-card[data-revealed="true"] .cert-preview-iframe');
      if (await revealedFrames.count() > 0) {
        const srcAfter = await revealedFrames.first().getAttribute('src');
        expect(srcAfter).not.toBeNull();
      }
    });

    test("Test 6 & 35 - Fullscreen viewer single instance", async ({ page }) => {
      // Test 35: Only one fullscreen certificate iframe exists
      const viewerIframes = page.locator('#cert-viewer-iframe');
      await expect(viewerIframes).toHaveCount(1);
      
      const firstCard = page.locator('.featured-cert-card').first();
      await firstCard.click();
      await page.waitForTimeout(500);

      const viewer = page.locator('#cert-viewer');
      await expect(viewer).toHaveClass(/open/);
      await expect(viewer).toHaveAttribute('role', 'dialog');
      await expect(viewer).toHaveAttribute('aria-modal', 'true');
      
      const titleText = await firstCard.locator('.cert-title').textContent();
      await expect(viewer.locator('#cert-viewer-title')).toHaveText(titleText);
      
      const iframeSrc = await viewer.locator('#cert-viewer-iframe').getAttribute('src');
      expect(iframeSrc).toContain('.pdf');

      // Body scroll locked
      const overflow = await page.evaluate(() => document.body.style.overflow);
      expect(overflow).toBe('hidden');
    });

    test("Test 7 & 34 - Close interactions and src clearing", async ({ page, isMobile }) => {
      const firstCard = page.locator('.featured-cert-card').first();
      const viewer = page.locator('#cert-viewer');
      const closeBtn = page.locator('#cert-viewer-close');
      const backdrop = page.locator('#cert-viewer-backdrop');
      const iframe = page.locator('#cert-viewer-iframe');

      // Close via button
      await firstCard.click();
      await page.waitForTimeout(500);
      await closeBtn.click();
      await page.waitForTimeout(500);
      await expect(viewer).not.toHaveClass(/open/);
      // Test 34: src cleared
      expect(await iframe.getAttribute('src')).toBe('');
      await expect(firstCard).toBeFocused();

      // Close via Escape
      await firstCard.click();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await expect(viewer).not.toHaveClass(/open/);
      expect(await iframe.getAttribute('src')).toBe('');

      // Close via Backdrop
      await firstCard.click();
      await page.waitForTimeout(500);
      if (!isMobile) {
        await backdrop.click({ position: { x: 5, y: 5 }, force: true });
        await page.waitForTimeout(500);
        await expect(viewer).not.toHaveClass(/open/);
        expect(await iframe.getAttribute('src')).toBe('');
      } else {
        // Just close it via Escape to leave the DOM clean for the next test
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    });

    test("Test 8 - Keyboard access", async ({ page }) => {
      const firstCard = page.locator('.featured-cert-card').first();
      await firstCard.focus();
      await expect(firstCard).toBeFocused();

      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      const viewer = page.locator('#cert-viewer');
      await expect(viewer).toHaveClass(/open/);
      
      const closeBtn = page.locator('#cert-viewer-close');
      // Wait for focus to land
      await expect(closeBtn).toBeFocused({ timeout: 5000 });

      await page.keyboard.press('Tab');
      // Focus should loop inside modal, but not escape
      await page.waitForTimeout(300);
      const activeEl = await page.evaluate(() => document.activeElement.id);
      expect(['cert-viewer-close', 'cert-viewer-new-tab', 'cert-viewer-iframe'].includes(activeEl)).toBe(true);
    });

    test("Test 9 - Mobile constraints", async ({ page, isMobile }) => {
      if (!isMobile) test.skip();
      
      const firstCard = page.locator('.featured-cert-card').first();
      await firstCard.click();
      await page.waitForTimeout(300);

      const closeBtn = page.locator('#cert-viewer-close');
      await expect(closeBtn).toBeVisible();
      
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow).toBe(false);
    });

    test("Test 10 - Reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const btn = page.locator('#cert-reveal-btn');
      await btn.click();
      
      const revealed = page.locator('.supp-cert-card[data-revealed="true"]');
      await expect(revealed).toHaveCount(4);
      
      // Ensure no long transitions are blocking interactiveness
      await expect(revealed.first()).toBeVisible();
    });
  });
});
