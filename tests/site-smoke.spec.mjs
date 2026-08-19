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

    const title = page.locator(".hero-v2-name");
    await expect(title).toBeVisible();

    const textContent = await title.textContent();
    expect(textContent).toContain("Hafiz Muhammad");
    expect(textContent).toContain("Abdullah");

    const lines = await page.locator(".hero-v2-name-row").count();
    expect(lines).toBe(2);

    const namePrimary = page.locator(".hero-v2-name-row").first();
    const primaryColor = await namePrimary.evaluate(
      (el) => getComputedStyle(el).color,
    );
    expect(primaryColor).toContain("rgb(244, 243, 238)");

    const nameAccent = page.locator(".hero-v2-name-accent");
    await expect(nameAccent).toBeVisible();

    const statement = page.locator(".hero-v2-lead");
    await expect(statement).toBeVisible();

    const actions = page.locator(".hero-v2-actions .btn").first();
    await expect(actions).toBeVisible();
  });

  test("Hero Abdullah line actual visibility", async ({ page, isMobile }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);

    const nameAccent = page.locator(".hero-v2-name-accent");
    
    await expect(nameAccent).toBeVisible();
    await expect(nameAccent).toContainText("Abdullah");

    const computedOpacity = await nameAccent.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(computedOpacity).toBe("1");
    
    const computedVisibility = await nameAccent.evaluate((el) => window.getComputedStyle(el).visibility);
    expect(computedVisibility).toBe("visible");
    
    const box = await nameAccent.boundingBox();
    expect(box).not.toBeNull();
    
    if (!isMobile) {
      expect(box.width).toBeGreaterThan(100);
    }
    expect(box.height).toBeGreaterThan(40);
    
    const hasVisibleFill = await nameAccent.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const textFill = style.webkitTextFillColor || style.color;
      const bgClip = style.webkitBackgroundClip || style.backgroundClip;
      if (textFill === "rgba(0, 0, 0, 0)" || textFill === "transparent") {
        return bgClip === "text" && style.backgroundImage !== "none";
      }
      return true;
    });
    expect(hasVisibleFill).toBeTruthy();
    
    await expect(nameAccent).toBeInViewport();
    
    // Check ancestors aren't hiding it
    const isHiddenByAncestor = await nameAccent.evaluate((el) => {
      let current = el.parentElement;
      while (current) {
        const style = window.getComputedStyle(current);
        if (style.opacity === "0" || style.visibility === "hidden") {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    });
    expect(isHiddenByAncestor).toBe(false);
  });

  test.describe("Section Navigation", () => {
    const navTests = [
      {
        name: "Projects",
        hash: "#projects",
        selector: "#projects",
        prevSelector: null,
      },
      {
        name: "Experience",
        hash: "#experience",
        selector: "#experience",
        prevSelector: "#projects",
      },
      {
        name: "Certificates",
        hash: "#credentials",
        selector: "#credentials",
        prevSelector: "#experience",
      },
      {
        name: "Journey",
        hash: "#journey",
        selector: "#journey",
        prevSelector: "#achievements",
      },
      {
        name: "About",
        hash: "#about",
        selector: "#about",
        prevSelector: "#journey",
      },
      {
        name: "Contact",
        hash: "#contact",
        selector: "#contact",
        prevSelector: "#about",
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
    await expect(links.nth(3).locator("strong")).toHaveText("YouTube");

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
      "https://www.youtube.com/@abdullahcyberx",
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
      
      // Wait for reveal animations to settle
      await page.waitForTimeout(800);

      // Read every box in one browser pass so late page-height changes cannot
      // shift viewport-relative coordinates between individual assertions.
      const { statementBox, linksBox, copyBox, profileBoxes } =
        await page.evaluate(() => {
          const toBox = (element) => {
            const box = element.getBoundingClientRect();
            return {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
            };
          };

          return {
            statementBox: toBox(document.querySelector(".about-statement")),
            linksBox: toBox(document.querySelector(".about-links-block")),
            copyBox: toBox(document.querySelector(".about-copy")),
            profileBoxes: Array.from(
              document.querySelectorAll(".profile-link"),
              toBox,
            ),
          };
        });

      // Links block is to the left of copy
      expect(linksBox.x + linksBox.width).toBeLessThanOrEqual(copyBox.x + 4);

      // Statement is to the left of copy
      expect(statementBox.x + statementBox.width).toBeLessThanOrEqual(copyBox.x + 4);
      
      // 2x2 grid for profile links
      expect(profileBoxes).toHaveLength(4);
      const [link1, link2, link3, link4] = profileBoxes;

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
      await page.waitForTimeout(800);

      const boxes = await page.locator(".about-links-list").evaluate((list) =>
        Array.from(list.querySelectorAll(".profile-link"), (element) => {
          const box = element.getBoundingClientRect();
          return { y: box.y };
        }),
      );
      expect(boxes).toHaveLength(4);
      const rows = boxes.map((box) => Math.round(box.y)).sort((a, b) => a - b);
      expect(new Set(rows).size).toBe(4);
      for (let index = 1; index < rows.length; index += 1) {
        expect(rows[index] - rows[index - 1]).toBeGreaterThan(20);
      }
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
      const aiBtn = page.locator("[data-ai-open]");
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

      const heroSection = page.locator(".hero-v2");
      const skillMapSection = page.locator("#projects");
      
      const hBox = await heroSection.boundingBox();
      const skillMapBox = await skillMapSection.boundingBox();

      const gap = skillMapBox.y - (hBox.y + hBox.height);
      
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

      const sections = ["#projects", "#experience", "#credentials", "#achievements", "#journey", "#about", "#contact"];
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

  test.describe("Unified journey", () => {


    test("Journey is generated, ordered, filtered and progressively expanded", async ({ page }) => {
      await page.goto("/");

      const allItems = page.locator(".journey-item");
      await expect(allItems).toHaveCount(28);
      await expect(page.locator(".journey-item:not([hidden])")).toHaveCount(10);
      await expect(page.locator(".journey-item:not([hidden])").first()).toContainText("2026");

      const projectFilter = page.locator('[data-journey-filter="project"]');
      await projectFilter.click();
      await expect(projectFilter).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".journey-item:not([hidden])")).toHaveCount(4);
      await expect(page.locator('.journey-item:not([hidden])[data-journey-tags~="project"]')).toHaveCount(4);
      await expect(page.locator("#journey-more")).toBeHidden();

      const ctfFilter = page.locator('[data-journey-filter="ctf"]');
      await ctfFilter.click();
      await expect(page.locator(".journey-item:not([hidden])")).toHaveCount(6);
      await expect(page.locator(".journey-item:not([hidden]) .journey-ctf-mark")).toHaveCount(6);

      await page.locator('[data-journey-filter="all"]').click();
      await page.locator("#journey-more").click();
      await expect(page.locator(".journey-item:not([hidden])")).toHaveCount(28);
      await expect(page.locator("#journey-more")).toHaveAttribute("aria-expanded", "true");
    });


  });


  test.describe("Back to top and Shehzada AI", () => {
    const sendAiMessage = async (page, question) => {
      const answers = page.locator(".ai-message.ai-assistant-message .ai-bubble");
      const previousCount = await answers.count();
      await page.locator("#ai-input").fill(question);
      await page.locator("#ai-form").evaluate((form) => form.requestSubmit());
      await expect(answers).toHaveCount(previousCount + 1, { timeout: 5000 });
      return answers.last();
    };

    const expectBoxesClose = (actual, expected, tolerance = 3) => {
      for (const key of ["x", "y", "width", "height"]) {
        expect(
          Math.abs(actual[key] - expected[key]),
          `${key}: expected ${expected[key]}, received ${actual[key]}`,
        ).toBeLessThanOrEqual(tolerance);
      }
    };

    test("Back to top button scrolls and cleans up URL", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.click('#back-to-top');
      await page.waitForFunction(() => window.scrollY === 0, { timeout: 2000 });
      const hash = await page.evaluate(() => window.location.hash);
      expect(hash).toBe("");
    });

    test("AI assistant desktop compact, maximize, restore, close and reopen", async ({ page, isMobile }) => {
      if (isMobile) test.skip();
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("/");
      await page.locator("[data-ai-open]").click();
      await page.waitForTimeout(500);

      const aiDialog = page.locator("#ai-assistant");
      const aiPanel = page.locator(".ai-panel");
      await expect(aiPanel).toBeVisible();

      const compactBox = await aiPanel.boundingBox();
      expectBoxesClose(compactBox, { x: 984, y: 164, width: 440, height: 720 });

      await sendAiMessage(page, "Who is Muhammad?");
      await page.locator("#ai-input").fill("Unsent draft");
      const messageCount = await page.locator(".ai-message").count();

      await page.locator("#ai-maximize-btn").click();
      await page.waitForTimeout(500);
      await expect(aiDialog).toHaveClass(/is-maximized/);
      await expect(page.locator("#ai-maximize-btn")).toHaveAttribute("aria-label", "Restore AI assistant");
      const maximizedBox = await aiPanel.boundingBox();
      expectBoxesClose(maximizedBox, { x: 16, y: 16, width: 1408, height: 868 });
      await expect(page.locator("#ai-input")).toHaveValue("Unsent draft");
      await expect(page.locator(".ai-message")).toHaveCount(messageCount);

      await page.locator("#ai-maximize-btn").click();
      await page.waitForTimeout(500);
      await expect(aiDialog).not.toHaveClass(/is-maximized/);
      const restoredBox = await aiPanel.boundingBox();
      expectBoxesClose(restoredBox, compactBox);
      await expect(page.locator("#ai-input")).toHaveValue("Unsent draft");
      await expect(page.locator(".ai-message")).toHaveCount(messageCount);

      await page.locator("#ai-maximize-btn").click();
      await page.waitForTimeout(500);
      await page.locator(".ai-close-button").click();
      await expect(aiDialog).not.toHaveClass(/open/);
      await expect(aiDialog).not.toHaveClass(/is-maximized/);
      await page.locator("[data-ai-open]").click();
      await page.waitForTimeout(500);
      await expectBoxesClose(await aiPanel.boundingBox(), compactBox);
      await expect(page.locator("#ai-input")).toHaveValue("Unsent draft");
      await expect(page.locator(".ai-message")).toHaveCount(messageCount);

      await page.locator("#ai-maximize-btn").click();
      await page.reload();
      await page.locator("[data-ai-open]").click();
      await page.waitForTimeout(500);
      await expect(aiDialog).not.toHaveClass(/is-maximized/);
      expectBoxesClose(await aiPanel.boundingBox(), compactBox);
      await expect(page.locator(".ai-message")).toHaveCount(messageCount);
      await expect(page.locator(".ai-message.ai-assistant-message .ai-bubble")).toContainText("Muhammad Abdullah");

      for (const selector of ["#ai-jump-to-latest", "#ai-stop-btn", "#ai-voice-input", "#ai-voice-output"]) {
        await expect(page.locator(selector)).toHaveCount(0);
      }
    });

    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
    ]) {
      test(`AI assistant mobile fullscreen ${viewport.width}x${viewport.height}`, async ({ page, isMobile }) => {
        if (!isMobile) test.skip();
        await page.setViewportSize(viewport);
        await page.goto("/");
        await page.locator("[data-ai-open]").click();
        await page.waitForTimeout(400);

        const panel = page.locator(".ai-panel");
        expectBoxesClose(await panel.boundingBox(), { x: 0, y: 0, ...viewport }, 1);
        await expect(page.locator("#ai-maximize-btn")).toBeHidden();
        await expect(page.locator(".ai-close-button")).toBeVisible();
        await expect(page.locator("#ai-form")).toBeVisible();

        const layout = await page.evaluate(() => {
          const header = document.querySelector(".ai-header").getBoundingClientRect();
          const actions = document.querySelector(".ai-header-actions").getBoundingClientRect();
          const identity = document.querySelector(".ai-identity").getBoundingClientRect();
          const composer = document.querySelector(".ai-composer-shell").getBoundingClientRect();
          const conversation = document.querySelector("#ai-conversation").getBoundingClientRect();
          const panel = document.querySelector(".ai-panel");
          return {
            header: { left: header.left, right: header.right },
            identityRight: identity.right,
            actionsLeft: actions.left,
            composerTop: composer.top,
            composerBottom: composer.bottom,
            conversationTop: conversation.top,
            conversationBottom: conversation.bottom,
            panelClientWidth: panel.clientWidth,
            panelScrollWidth: panel.scrollWidth,
          };
        });
        expect(layout.identityRight).toBeLessThanOrEqual(layout.actionsLeft + 1);
        expect(layout.composerBottom).toBeLessThanOrEqual(viewport.height + 1);
        expect(layout.conversationBottom).toBeLessThanOrEqual(layout.composerTop + 1);
        expect(layout.panelScrollWidth).toBe(layout.panelClientWidth);
      });
    }

    test("Shehzada AI chat rendering, composer and safe text", async ({ page }) => {
      await page.goto("/");
      await page.locator("[data-ai-open]").click();
      await expect(page.locator("#ai-welcome")).toBeVisible();
      await expect(page.locator("[data-ai-question]")).toHaveCount(4);
      await expect(page.locator("[data-ai-question]").allTextContents()).resolves.toEqual([
        expect.stringContaining("Why hire Muhammad?"),
        expect.stringContaining("Strongest projects"),
        expect.stringContaining("Internship experience"),
        expect.stringContaining("Technical skills"),
      ]);

      await page.locator("#ai-input").fill("Line one");
      await page.keyboard.press("Shift+Enter");
      await page.keyboard.type("Line two");
      await expect(page.locator("#ai-input")).toHaveValue("Line one\nLine two");

      await page.locator("#ai-input").fill("<img src=x onerror=window.aiInjected=true>");
      await page.evaluate(() => {
        window.aiThinkingTiming = {};
        const observer = new MutationObserver(() => {
          const thinking = document.querySelector(".ai-thinking");
          if (thinking && window.aiThinkingTiming.started === undefined) {
            window.aiThinkingTiming.started = performance.now();
          }
          if (!thinking && window.aiThinkingTiming.started !== undefined && window.aiThinkingTiming.ended === undefined) {
            window.aiThinkingTiming.ended = performance.now();
            observer.disconnect();
          }
        });
        observer.observe(document.querySelector("#ai-messages"), { childList: true, subtree: true });
      });
      await page.locator("#ai-form").evaluate((form) => form.requestSubmit());
      await expect(page.locator(".ai-message.ai-assistant-message .ai-bubble").last()).toContainText("focused on Muhammad's portfolio");
      const thinkingDuration = await page.evaluate(() => window.aiThinkingTiming.ended - window.aiThinkingTiming.started);
      expect(thinkingDuration).toBeGreaterThanOrEqual(100);
      expect(thinkingDuration).toBeLessThanOrEqual(300);
      await expect(page.locator(".ai-user .ai-bubble").last()).toHaveText("<img src=x onerror=window.aiInjected=true>");
      await expect(page.locator(".ai-user img")).toHaveCount(0);
      expect(await page.evaluate(() => window.aiInjected)).toBeUndefined();

      const positions = await page.evaluate(() => {
        const assistant = document.querySelector(".ai-message.ai-assistant-message .ai-bubble").getBoundingClientRect();
        const user = document.querySelector(".ai-message.ai-user .ai-bubble").getBoundingClientRect();
        return { assistantLeft: assistant.left, userLeft: user.left };
      });
      expect(positions.userLeft).toBeGreaterThan(positions.assistantLeft);

      await page.locator("#ai-input").fill("x".repeat(439));
      await expect(page.locator("#ai-char-count")).not.toHaveClass(/is-near-limit/);
      await page.locator("#ai-input").fill("x".repeat(440));
      await expect(page.locator("#ai-char-count")).toHaveClass(/is-near-limit/);
      await expect(page.locator("#ai-char-count")).toHaveText("440 / 500");
    });

    test("Shehzada AI local engine regressions and follow-up context", async ({ page }) => {
      await page.goto("/");
      await page.locator("[data-ai-open]").click();

      await expect(await sendAiMessage(page, "Who is Muhammad?")).toContainText("Muhammad Abdullah");
      await expect(await sendAiMessage(page, "Explain the Modular Recon Tool.")).toContainText("Modular Recon Tool");
      await expect(await sendAiMessage(page, "What tools did he use?")).toContainText("Modular Recon Tool");
      await expect(await sendAiMessage(page, "Why should someone hire him?")).toContainText(/practical|project/i);
      await expect(await sendAiMessage(page, "What is the weather today?")).toContainText("focused on Muhammad's portfolio");
    });

    test("Shehzada AI clear, recruiter briefing, evidence scan and CTF challenge", async ({ page }) => {
      await page.goto("/");
      await page.locator("[data-ai-open]").click();

      await expect(await sendAiMessage(page, "Recruiter briefing")).toContainText("Muhammad Abdullah");
      await expect(await sendAiMessage(page, "Evidence scan")).toContainText("Evidence Scan");
      await expect(await sendAiMessage(page, "CTF challenge")).toContainText(/CTF|challenge/i);
      await expect(await sendAiMessage(page, "wrong answer")).toContainText(/try again/i);
      await expect(await sendAiMessage(page, "hint")).toContainText(/hint/i);
      await expect(await sendAiMessage(page, "sql injection")).toContainText(/Correct|Next/i);
      await expect(await sendAiMessage(page, "xss")).toContainText(/FLAG\{|Challenge/i);

      await page.locator("#ai-input").fill("/clear");
      await page.locator("#ai-input").press("Enter");
      await expect(page.locator(".ai-message")).toHaveCount(0);
      await expect(page.locator("#ai-welcome")).toBeVisible();
    });

    test("Shehzada AI focus trap, Escape close and opener restoration", async ({ page, isMobile }) => {
      if (isMobile) test.skip();
      await page.goto("/");
      const opener = page.locator("[data-ai-open]");
      await opener.focus();
      await opener.press("Enter");
      await expect(page.locator("#ai-assistant")).toHaveClass(/open/);
      await expect(page.locator("#ai-input")).toBeFocused();

      await page.locator("#ai-send-btn").focus();
      await page.keyboard.press("Tab");
      await expect(page.locator("#ai-clear-btn")).toBeFocused();

      await page.keyboard.press("Escape");
      await expect(page.locator("#ai-assistant")).not.toHaveClass(/open/);
      await expect(opener).toBeFocused();
    });
  });

  test.describe("Logo and Network Verifications", () => {
    test("Logos and favicons return 200 and render correctly", async ({ page, isMobile }) => {
      // Collect all network responses for images
      const imageResponses = [];
      page.on('response', response => {
        if (response.request().resourceType() === 'image') {
          imageResponses.push(response);
        }
      });

      await page.goto("/");
      
      // Check network status
      for (const res of imageResponses) {
        const url = res.url();
        if (url.includes('abdullah-cyber-symbol') || url.includes('favicon')) {
          expect(res.status()).toBe(200);
          expect(res.headers()['content-type']).toContain('image/');
          const length = parseInt(res.headers()['content-length'] || "0", 10);
          expect(length).toBeGreaterThan(0);
        }
      }

      // Check header logo
      const headerLogo = page.locator('.site-logo-symbol');
      await expect(headerLogo).toBeVisible();
      const headerImgComplete = await headerLogo.evaluate(img => img.complete);
      expect(headerImgComplete).toBe(true);
      const headerImgWidth = await headerLogo.evaluate(img => img.naturalWidth);
      expect(headerImgWidth).toBeGreaterThan(0);



      // Check AI launcher logo
      const aiLauncherLogo = page.locator('.ai-launcher-symbol .ai-logo-symbol');
      await expect(aiLauncherLogo).toBeVisible();
      const aiLauncherImgComplete = await aiLauncherLogo.evaluate(img => img.complete);
      expect(aiLauncherImgComplete).toBe(true);
      const aiLauncherImgWidth = await aiLauncherLogo.evaluate(img => img.naturalWidth);
      expect(aiLauncherImgWidth).toBeGreaterThan(0);

      // Check AI dialog header logo
      await page.locator('.ai-launcher').click();
      const aiHeaderLogo = page.locator('.ai-header .ai-logo-symbol');
      await expect(aiHeaderLogo).toBeVisible();
      const aiHeaderImgComplete = await aiHeaderLogo.evaluate(img => img.complete);
      expect(aiHeaderImgComplete).toBe(true);
      const aiHeaderImgWidth = await aiHeaderLogo.evaluate(img => img.naturalWidth);
      expect(aiHeaderImgWidth).toBeGreaterThan(0);
    });
  });

  test.describe("Hero and Monogram Interactive Tests", () => {
    test("Hero typography, variable font hover stretch and mobile behavior", async ({ page, isMobile }) => {
      await page.goto("/");
      await page.waitForTimeout(1200);

      const h1 = page.locator("h1.hero-v2-name");
      await expect(h1).toHaveAttribute("aria-label", "Hafiz Muhammad Abdullah");

      const lines = h1.locator(".hero-v2-name-row");
      await expect(lines).toHaveCount(2);
      await expect(lines.nth(0)).toHaveText("Hafiz Muhammad");
      await expect(lines.nth(1)).toContainText("Abdullah");

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);

      const namePrimaryOuter = page.locator(".hero-v2-name-row").first();
      
      const initialFontSettings = await namePrimaryOuter.evaluate(el => getComputedStyle(el).fontVariationSettings);
      const initialWidth = await h1.evaluate(el => el.getBoundingClientRect().width);
      
      if (!isMobile) {
        await h1.hover();
        await page.waitForTimeout(700);
        
        const hoverFontSettings = await namePrimaryOuter.evaluate(el => getComputedStyle(el).fontVariationSettings);
        expect(hoverFontSettings).not.toBe(initialFontSettings);
        expect(hoverFontSettings).toContain('"wdth" 98'); // Specific value check
        
        const hoverWidth = await h1.evaluate(el => el.getBoundingClientRect().width);
        expect(hoverWidth).toBe(initialWidth); // Outer layout remains stable
        
        await page.mouse.move(0, 0);
        await page.waitForTimeout(700);
        
        const endFontSettings = await namePrimaryOuter.evaluate(el => getComputedStyle(el).fontVariationSettings);
        expect(endFontSettings).toBe(initialFontSettings);
      } else {
        await h1.hover();
        await page.waitForTimeout(700);
        
        const hoverFontSettings = await namePrimaryOuter.evaluate(el => getComputedStyle(el).fontVariationSettings);
        expect(hoverFontSettings).toBe(initialFontSettings);
      }
    });

    test("Statistics card identity mark HMA", async ({ page }) => {
      await page.goto("/");
      const initials = page.locator(".snapshot-header");
      await expect(initials).toBeVisible();
      const text = await initials.textContent();
      expect(text).not.toContain("HMA");
      expect(text).not.toContain("MA.");
      expect(text).toContain("Career Snapshot");
    });
  });

  test.describe("About Page Identity & SEO Tests", () => {
    test("About page loads correctly and meets all identity requirements", async ({ page, isMobile }) => {
      const response = await page.goto("/about/");
      expect(response.status()).toBe(200);

      // H1 contains exactly: Hafiz Muhammad Abdullah
      const h1 = page.locator("h1");
      await expect(h1).toHaveText("Hafiz Muhammad Abdullah");

      // Verify canonical URL
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe("https://abdullahcyber.dev/about/");

      const pageText = await page.locator("body").textContent();
      
      // Positive assertions
      expect(pageText).toContain("Muhammad Abdullah");
      expect(pageText).toContain("Abdullah Cyber");
      expect(pageText).toContain("@abdullahcyberx");
      expect(pageText).toContain("Junior Cybersecurity Analyst");
      expect(pageText).toContain("BS Cyber Security");
      expect(pageText).toContain("Riphah International University");

      // Negative assertions
      expect(pageText).not.toContain("undefined");
      expect(pageText).not.toContain("null");
      expect(pageText).not.toContain("Known online as: undefined");
      expect(pageText).not.toContain("Professional name: Hafiz Muhammad Abdullah");
      expect(pageText).not.toContain("Skill Map");

      // Validate JSON-LD
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const ld = JSON.parse(jsonLdContent);
      
      const personEntity = ld["@graph"].find(entity => entity["@type"] === "Person");
      expect(personEntity).toBeDefined();
      expect(personEntity.name).toBe("Hafiz Muhammad Abdullah");
      expect(personEntity.alternateName).toContain("Muhammad Abdullah");
      expect(personEntity.alternateName).toContain("Abdullah Cyber");
      expect(personEntity.alternateName).toContain("abdullahcyberx");
      
      const profileEntity = ld["@graph"].find(entity => entity["@type"] === "ProfilePage");
      expect(profileEntity).toBeDefined();
      expect(profileEntity.mainEntity["@id"]).toBe("https://abdullahcyber.dev/#person");
      expect(personEntity["@id"]).toBe("https://abdullahcyber.dev/#person");

      // Mobile overflow check
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow).toBeFalsy();
    });
  });
});
