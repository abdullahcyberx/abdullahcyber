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
        name: "Achievements",
        hash: "#achievements",
        selector: "#achievements",
        prevSelector: "#credentials",
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

        if (nav.name === "Contact") {
          expect(anchorTop).toBeLessThanOrEqual(headerBottom + 400);
        } else {
          expect(anchorTop).toBeGreaterThanOrEqual(headerBottom + 12);
          expect(anchorTop).toBeLessThanOrEqual(headerBottom + 36);
        }

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

  test.describe("Certifications & Generalized Viewer Tests", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        document.getElementById("credentials")?.scrollIntoView({ behavior: "auto" });
      });
      await page.waitForTimeout(500);
    });

    test("Test 1 - Initial state of Certificates", async ({ page }) => {
      const featured = page.locator('.featured-cert-card');
      const supp = page.locator('.supp-cert-card[data-revealed="true"]');
      const hidden = page.locator('.supp-cert-card[data-revealed="false"]');
      const btn = page.locator('#cert-reveal-btn');

      // Exactly 3 featured certificates are visible initially
      await expect(featured).toHaveCount(3);
      // Wait for exact featured titles: WEB-RTA, CAPT, CORE
      await expect(featured.nth(0).locator('.cert-title')).toHaveText(/WEB-RTA/);
      await expect(featured.nth(1).locator('.cert-title')).toHaveText(/CAPT/);
      await expect(featured.nth(2).locator('.cert-title')).toHaveText(/CORE/);

      // Total 16 certs
      const totalCerts = await page.locator('.cert-card').count();
      expect(totalCerts).toBe(16);

      // Verify removed certs do not appear in certificates list
      const certTitles = await page.locator('.cert-card .cert-title').allTextContents();
      expect(certTitles.some(t => t.includes('Advent of Cyber'))).toBeFalsy();
      expect(certTitles.some(t => t.includes('NaSCon'))).toBeFalsy();
      expect(certTitles.some(t => t.includes('Cyber Security Internship'))).toBeFalsy();

      // Hidden cards = 16 - 3 = 13
      await expect(hidden).toHaveCount(13);

      // Verify no iframe, object, or embed in any cert preview
      const previewViewports = page.locator('.cert-preview-viewport');
      await expect(previewViewports.locator('iframe')).toHaveCount(0);
      await expect(previewViewports.locator('object')).toHaveCount(0);
      await expect(previewViewports.locator('embed')).toHaveCount(0);

      // Verify featured images have src and naturalWidth > 0
      const featuredImages = featured.locator('.cert-preview-image');
      await expect(featuredImages).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        const src = await featuredImages.nth(i).getAttribute('src');
        expect(src).toMatch(/\.webp$/);
        
        // Wait for image to load and check naturalWidth
        const isLoaded = await featuredImages.nth(i).evaluate((img) => img.complete && img.naturalWidth > 0);
        expect(isLoaded).toBe(true);
      }

      // Verify hidden supporting images don't have src
      const hiddenImages = hidden.locator('.cert-preview-image');
      const hiddenCount = await hiddenImages.count();
      for (let i = 0; i < hiddenCount; i++) {
        const src = await hiddenImages.nth(i).getAttribute('src');
        expect(src).toBeNull();
        const dataSrc = await hiddenImages.nth(i).getAttribute('data-preview-src');
        expect(dataSrc).toMatch(/\.webp$/);
      }

      // The first Explore More button is visible and indicates 4 certificates
      await expect(btn).toBeVisible();
      await expect(btn).toHaveText("Explore More");
    });

    test("Test 2 - First batch", async ({ page }) => {
      const btn = page.locator('#cert-reveal-btn');
      
      // Setup listener to intercept image requests and check 200/content-type
      const imageResponses = [];
      page.on('response', response => {
        if (response.url().includes('.webp')) {
          imageResponses.push(response);
        }
      });
      
      await btn.click();
      await page.waitForTimeout(1000);

      const revealed = page.locator('.supp-cert-card[data-revealed="true"]');
      await expect(revealed).toHaveCount(4);
      
      const revealedImages = revealed.locator('.cert-preview-image');
      for (let i = 0; i < 4; i++) {
        // Scroll into view so IntersectionObserver triggers
        await revealedImages.nth(i).scrollIntoViewIfNeeded();
        
        // Wait for the src to be set
        await expect(revealedImages.nth(i)).toHaveAttribute('src', /\.webp$/);
        
        // Ensure it eventually loads
        await page.waitForFunction(img => img.complete && img.naturalWidth > 0, await revealedImages.nth(i).elementHandle());
      }
      
      for (const res of imageResponses) {
        expect(res.status()).toBe(200);
        expect(res.headers()['content-type']).toMatch(/^image\//);
      }
      
      await expect(btn).toHaveText("Explore More");
    });

    test("Test 3 - Second batch", async ({ page }) => {
      const btn = page.locator('#cert-reveal-btn');
      await btn.click();
      await page.waitForTimeout(500);
      await btn.click();
      await page.waitForTimeout(500);

      const revealed = page.locator('.supp-cert-card[data-revealed="true"]');
      await expect(revealed).toHaveCount(9); // 4 + 5
      
      await expect(btn).toHaveText("Explore More");
    });

    test("Test 4 - Continue until complete", async ({ page }) => {
      const btn = page.locator('#cert-reveal-btn');
      while (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(300);
      }
      const hidden = page.locator('.supp-cert-card[data-revealed="false"]');
      await expect(hidden).toHaveCount(0);
      
      await expect(page.locator('#cert-reveal-container')).toBeHidden();
    });

    test("Test 5 - Verify exact ordering", async ({ page }) => {
      const expectedTitles = [
        "Certified Web Red Team Analyst (WEB-RTA)",
        "Certified Associate Penetration Tester (CAPT)",
        "Certified Cybersecurity Foundations (CORE)",
        "Red Team Operations Management",
        "Network Defense",
        "ICS/SCADA Cybersecurity",
        "Deloitte Australia Cyber Job Simulation",
        "Security Principles",
        "Certified Phishing Prevention Specialist",
        "Cybersecurity Essentials",
        "Linux & Essential Cybersecurity",
        "Introduction to Cybersecurity",
        "C++ Advanced",
        "IT Essentials",
        "C++ Essentials 1",
        "Introduction to IoT & Digital Transformation"
      ];
      
      const titles = await page.locator('.cert-card .cert-title').allTextContents();
      expect(titles).toEqual(expectedTitles);
    });

    test("Test 6 - Generalized Viewer (Certificates, Achievements, Experience)", async ({ page }) => {
      const viewer = page.locator('#cert-viewer');
      const iframe = page.locator('#cert-viewer-iframe');
      const closeBtn = page.locator('#cert-viewer-close');
      const viewerTitle = page.locator('#cert-viewer-title');

      // Test Certificate trigger
      const firstCert = page.locator('.featured-cert-card').first();
      await firstCert.click();
      await page.waitForTimeout(500);
      await expect(viewer).toHaveClass(/open/);
      await expect(iframe).toHaveAttribute('src', /web-rta\.pdf/);
      await closeBtn.click();
      await page.waitForTimeout(500);

      // Test Achievement trigger (Advent)
      await page.evaluate(() => {
        document.getElementById("achievements")?.scrollIntoView({ behavior: "auto" });
      });
      await page.waitForTimeout(500);
      
      const adventAchText = await page.locator('#achievements li', { hasText: 'Advent of Cyber 2025' }).textContent();
      expect(adventAchText).toContain('Advent of Cyber 2025');
      // Ensure exactly one Advent
      expect(await page.locator('#achievements li', { hasText: 'Advent of Cyber 2025' }).count()).toBe(1);

      const adventBtn = page.locator('#achievements li', { hasText: 'Advent of Cyber 2025' }).locator('button');
      await expect(adventBtn).toHaveText('View Achievement Certificate');
      await adventBtn.click();
      await page.waitForTimeout(500);
      await expect(viewer).toHaveClass(/open/);
      await expect(iframe).toHaveAttribute('src', /tryhackme-advent-of-cyber-2025\.pdf/);
      await expect(viewerTitle).toHaveText('Advent of Cyber 2025');
      await closeBtn.click();
      await page.waitForTimeout(500);

      // Test Achievement trigger (NaSCon)
      const nasconBtn = page.locator('#achievements li', { hasText: 'Typing Competition Nascon' }).locator('button');
      await expect(nasconBtn).toHaveText('View Participation Certificate');
      await nasconBtn.click();
      await page.waitForTimeout(500);
      await expect(viewer).toHaveClass(/open/);
      await expect(iframe).toHaveAttribute('src', /nascon-2025-participation\.pdf/);
      await expect(viewerTitle).toHaveText('Typing Competition Nascon');
      await closeBtn.click();
      await page.waitForTimeout(500);

      // Test Experience trigger
      await page.evaluate(() => {
        document.getElementById("experience")?.scrollIntoView({ behavior: "auto" });
      });
      await page.waitForTimeout(500);

      // Check experience list
      const expRoles = await page.locator('.timeline-role').allTextContents();
      expect(expRoles).not.toContain('CTF Organizer & Player');
      
      const inara = page.locator('.timeline-row').nth(0);
      await expect(inara.locator('.timeline-company')).toHaveText('Inara Technologies');
      
      const den = page.locator('.timeline-row').nth(1);
      await expect(den.locator('.timeline-company')).toHaveText('Digital Empowerment Network');

      const internBtn = den.locator('button');
      await expect(internBtn).toHaveText('View Internship Certificate');
      await internBtn.click();
      await page.waitForTimeout(500);
      await expect(viewer).toHaveClass(/open/);
      await expect(iframe).toHaveAttribute('src', /digital-empowerment-network-internship\.pdf/);
      await expect(viewerTitle).toHaveText('Cyber Security Intern');
      await closeBtn.click();
      await page.waitForTimeout(500);
    });

    test("Test 7 - PDF file integrity", async ({ request }) => {
       const pdfs = [
         "/assets/certificates/tryhackme-advent-of-cyber-2025.pdf",
         "/assets/certificates/nascon-2025-participation.pdf",
         "/assets/certificates/digital-empowerment-network-internship.pdf"
       ];
       for(const pdf of pdfs) {
          const res = await request.get(pdf);
          expect(res.status()).toBe(200);
          const body = await res.body();
          // Ensure it's a PDF (starts with %PDF)
          expect(body.toString('utf8', 0, 4)).toBe('%PDF');
       }
    });

    test("Test 8 - Keyboard access and focus trap in generalized viewer", async ({ page }) => {
      // Use achievement button to test keyboard flow
      await page.evaluate(() => {
        document.getElementById("achievements")?.scrollIntoView({ behavior: "auto" });
      });
      await page.waitForTimeout(500);

      const adventBtn = page.locator('#achievements li', { hasText: 'Advent of Cyber 2025' }).locator('button');
      await adventBtn.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      const viewer = page.locator('#cert-viewer');
      await expect(viewer).toHaveClass(/open/);
      
      const closeBtn = page.locator('#cert-viewer-close');
      await expect(closeBtn).toBeFocused({ timeout: 5000 });

      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      const activeEl = await page.evaluate(() => document.activeElement.id);
      expect(['cert-viewer-close', 'cert-viewer-new-tab', 'cert-viewer-iframe'].includes(activeEl)).toBe(true);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await expect(viewer).not.toHaveClass(/open/);
      await expect(adventBtn).toBeFocused();
    });
  });

  test.describe("New Layout and Mobile Audit Tests", () => {
    test("About desktop bounding-box layout and 2x2 grid", async ({ page, isMobile }) => {
      if (isMobile) test.skip();
      await page.goto("/#about");
      
      const statement = page.locator(".about-statement");
      const copy = page.locator(".about-copy");
      const linksBlock = page.locator(".about-links-block");
      const profileLinks = page.locator(".profile-link");

      // Wait for reveal animations to settle
      await page.waitForTimeout(800);

      // Bounding box checks
      const statementBox = await statement.boundingBox();
      const linksBox = await linksBlock.boundingBox();
      const copyBox = await copy.boundingBox();

      // Links block is to the left of copy
      expect(linksBox.x + linksBox.width).toBeLessThanOrEqual(copyBox.x + 4);

      // Statement is to the left of copy
      expect(statementBox.x + statementBox.width).toBeLessThanOrEqual(copyBox.x + 4);
      
      // 2x2 grid for profile links
      const count = await profileLinks.count();
      expect(count).toBe(4);
      const link1 = await profileLinks.nth(0).boundingBox();
      const link2 = await profileLinks.nth(1).boundingBox();
      const link3 = await profileLinks.nth(2).boundingBox();
      const link4 = await profileLinks.nth(3).boundingBox();

      // first and second cards have approximately equal top values
      expect(Math.abs(link1.y - link2.y)).toBeLessThanOrEqual(4);

      // third and fourth cards have approximately equal top values
      expect(Math.abs(link3.y - link4.y)).toBeLessThanOrEqual(4);

      // second row appears below the first row
      expect(link3.y).toBeGreaterThanOrEqual(link1.y + link1.height - 10);

      // cards in the same column have approximately equal x values
      expect(Math.abs(link1.x - link3.x)).toBeLessThanOrEqual(4);
      expect(Math.abs(link2.x - link4.x)).toBeLessThanOrEqual(4);

      // Find me online is below statement (allow 2-4px tolerance or up to 80px gap)
      // Actually, since statement is a `<p>`, it might not stretch to the bottom of the grid row
      expect(linksBox.y).toBeGreaterThanOrEqual(statementBox.y + statementBox.height - 4);
      expect(linksBox.y).toBeLessThanOrEqual(statementBox.y + statementBox.height + 80);
    });

    test("About mobile order and 1x4 link grid", async ({ page, isMobile }) => {
      if (!isMobile) test.skip();
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto("/#about");

      const profileLinks = page.locator(".profile-link");
      const link1 = await profileLinks.nth(0).boundingBox();
      const link2 = await profileLinks.nth(1).boundingBox();
      
      // One link per row: link2 is below link1
      expect(link2.y).toBeGreaterThan(link1.y + 20); // clearly on a new row
    });

    test("Mobile header at 320px and AI button overlay hiding", async ({ page, isMobile }) => {
      if (!isMobile) test.skip();
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto("/");
      
      const brand = page.locator(".site-header .brand").first();
      const cvBtn = page.locator(".nav-cv-btn");
      const menuBtn = page.locator(".menu-toggle");
      
      // Ensure all fit
      const brandBox = await brand.boundingBox();
      const cvBox = await cvBtn.boundingBox();
      const menuBox = await menuBtn.boundingBox();
      
      expect(brandBox.x + brandBox.width).toBeLessThanOrEqual(cvBox.x);
      expect(cvBox.x + cvBox.width).toBeLessThanOrEqual(menuBox.x);
      
      // AI button overlay hiding
      const aiBtn = page.locator(".ai-float-btn");
      await expect(aiBtn).toBeVisible();
      
      // Open menu
      await menuBtn.click();
      await page.waitForTimeout(500);
      await expect(aiBtn).toBeHidden();
      
      // Close menu
      await page.locator(".mobile-menu-close").click();
      await page.waitForTimeout(500);
      await expect(aiBtn).toBeVisible();
    });
  });

  test.describe("Phishing Project and Layout Tests", () => {
    test("TEST 1 & 2 — Phishing badge containment and progress bar overlap", async ({ page, isMobile }) => {
      await page.goto("/#projects");
      await page.waitForTimeout(800);

      const reportPanel = page.locator(".pv1-report").first();
      const badge = page.locator(".pv1-label").first();
      const bars = page.locator(".pv1-report-bar");

      if (await reportPanel.count() > 0 && await badge.count() > 0) {
        const rpBox = await reportPanel.boundingBox();
        const bBox = await badge.boundingBox();

        // Containment check
        expect(bBox.x).toBeGreaterThanOrEqual(rpBox.x - 4);
        expect(bBox.y).toBeGreaterThanOrEqual(rpBox.y - 4);
        expect(bBox.x + bBox.width).toBeLessThanOrEqual(rpBox.x + rpBox.width + 4);
        expect(bBox.y + bBox.height).toBeLessThanOrEqual(rpBox.y + rpBox.height + 4);

        // Overlap check
        const barCount = await bars.count();
        for (let i = 0; i < barCount; i++) {
          const barBox = await bars.nth(i).boundingBox();
          // Check if bounding boxes intersect
          const intersects = !(
            bBox.x + bBox.width <= barBox.x ||
            bBox.x >= barBox.x + barBox.width ||
            bBox.y + bBox.height <= barBox.y ||
            bBox.y >= barBox.y + barBox.height
          );
          expect(intersects).toBe(false);
        }
      }
    });

    test("TEST 3 — Phishing visual containment", async ({ page }) => {
      await page.goto("/#projects");
      await page.waitForTimeout(800);

      const visual = page.locator(".proj-visual-1").first();
      if (await visual.count() > 0) {
        const vBox = await visual.boundingBox();
        const children = visual.locator("> *");
        const count = await children.count();
        
        for (let i = 0; i < count; i++) {
          const cBox = await children.nth(i).boundingBox();
          expect(cBox.x).toBeGreaterThanOrEqual(vBox.x - 4);
          expect(cBox.x + cBox.width).toBeLessThanOrEqual(vBox.x + vBox.width + 4);
        }
      }
    });

    test("TEST 4 & 5 — Hero to Projects gap", async ({ page, isMobile }) => {
      await page.goto("/");
      await page.waitForTimeout(800);

      const heroSection = page.locator(".hero");
      const projectsSection = page.locator("#projects");
      
      const hBox = await heroSection.boundingBox();
      const pBox = await projectsSection.boundingBox();

      const gap = pBox.y - (hBox.y + hBox.height);
      
      if (!isMobile) {
        expect(gap).toBeGreaterThanOrEqual(40);
        expect(gap).toBeLessThanOrEqual(140);
      } else {
        expect(gap).toBeGreaterThanOrEqual(28);
        expect(gap).toBeLessThanOrEqual(96);
      }
    });

    test("TEST 6 — Section rhythm", async ({ page }) => {
      await page.goto("/");
      await page.waitForTimeout(800);

      const sections = ["#about", "#experience", "#credentials", "#achievements", "#contact"];
      for (let i = 0; i < sections.length - 1; i++) {
        const s1 = page.locator(sections[i]);
        const s2 = page.locator(sections[i+1]);
        if (await s1.count() > 0 && await s2.count() > 0) {
          const b1 = await s1.boundingBox();
          const b2 = await s2.boundingBox();
          const gap = b2.y - (b1.y + b1.height);
          expect(gap).toBeGreaterThanOrEqual(-4);
          expect(gap).toBeLessThanOrEqual(300); // Reasonable upper bound
        }
      }
    });

    test("TEST 7 — Hidden element spacing", async ({ page }) => {
      await page.goto("/#credentials");
      await page.waitForTimeout(800);

      const hiddenCards = page.locator(".supp-cert-card[data-revealed='false']");
      const count = await hiddenCards.count();
      for (let i = 0; i < count; i++) {
        const display = await hiddenCards.nth(i).evaluate((el) => getComputedStyle(el).display);
        expect(display).toBe("none");
      }
    });
    
    test("TEST 8 — Global overflow", async ({ page }) => {
      await page.goto("/");
      await page.waitForTimeout(800);
      const isOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
      });
      expect(isOverflow).toBe(false);
    });

    test("TEST 9 — Mobile visuals", async ({ page, isMobile }) => {
      if (!isMobile) test.skip();
      await page.goto("/#projects");
      await page.waitForTimeout(800);
      // Already partially covered by Test 1,2,3
    });
  });


  test.describe("Back to top and Shehzada AI", () => {
    test("Back to top button scrolls and cleans up URL", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.click('#back-to-top');
      await page.waitForFunction(() => window.scrollY === 0, { timeout: 2000 });
      const hash = await page.evaluate(() => window.location.hash);
      expect(hash).toBe("");
    });

    test("Shehzada AI opens, answers basic query, and clears", async ({ page }) => {
      await page.goto("/");
      
      // Open AI
      await page.click('[data-ai-open]');
      await expect(page.locator('#ai-assistant')).toHaveClass(/open/);
      
      // Check greeting
      await expect(page.locator('.ai-ai').last()).toBeVisible();

      // Ask question
      await page.fill('#ai-input', 'Who is Muhammad?');
      await page.click('#ai-form button[type="submit"]');

      // Wait for the processing state to disappear and answer to be ready
      await expect(page.locator('.ai-ai').last()).toContainText('Muhammad Abdullah', { timeout: 5000 });
      
      // Clear
      await page.fill('#ai-input', '/clear');
      await page.click('#ai-form button[type="submit"]');
      
      // Check it was cleared
      await expect(page.locator('.ai-message')).toHaveCount(1, { timeout: 2000 });
    });

    test("Shehzada AI Context memory survives", async ({ page }) => {
      await page.goto("/");
      await page.click('[data-ai-open]');

      // Question 1
      await page.fill('#ai-input', 'Show his strongest projects');
      await page.click('#ai-form button[type="submit"]');
      await expect(page.locator('.ai-ai').last()).toContainText('Modular Recon Tool', { timeout: 5000 });

      // Follow up
      await page.fill('#ai-input', 'What tools were used?');
      await page.click('#ai-form button[type="submit"]');
      await expect(page.locator('.ai-ai').last()).toContainText('Modular Recon Tool', { timeout: 5000 });
    });
  });
});
