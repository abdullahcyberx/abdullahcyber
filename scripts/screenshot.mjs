import { chromium } from "@playwright/test";
import fs from "fs";

(async () => {
  const browser = await chromium.launch();

  if (!fs.existsSync("screenshots")) {
    fs.mkdirSync("screenshots");
  }

  // Desktop
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const pageDesktop = await contextDesktop.newPage();
  await pageDesktop.goto("http://localhost:4173", { waitUntil: "networkidle" });
  await pageDesktop.waitForTimeout(1500);

  // Scroll to about links
  await pageDesktop.evaluate(() => {
    document
      .querySelector(".about-links-block")
      ?.scrollIntoView({ behavior: "auto", block: "center" });
  });
  await pageDesktop.waitForTimeout(800);
  await pageDesktop.screenshot({ path: "screenshots/about-links-desktop.png" });

  // Scroll to contact
  await pageDesktop.evaluate(() => {
    document
      .getElementById("contact")
      ?.scrollIntoView({ behavior: "auto", block: "start" });
  });
  await pageDesktop.waitForTimeout(800);
  await pageDesktop.screenshot({
    path: "screenshots/gmail-contact-desktop.png",
  });

  // Hover gmail contact
  await pageDesktop.hover(".gmail-contact");
  await pageDesktop.waitForTimeout(500);
  await pageDesktop.screenshot({ path: "screenshots/gmail-contact-hover.png" });

  // Navigation screenshots desktop
  const sectionsToScreenshot = ["about", "experience", "credentials", "contact"];
  for (const section of sectionsToScreenshot) {
    await pageDesktop.evaluate((s) => {
      document.querySelector(`.desktop-nav a[href="#${s}"]`)?.click();
    }, section);
    await pageDesktop.waitForTimeout(1000);
    const fileName = section === "credentials" ? "certificates" : section;
    await pageDesktop.screenshot({ path: `screenshots/navigation-${fileName}-desktop.png` });
  }

  await contextDesktop.close();

  // Mobile
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto("http://localhost:4173", { waitUntil: "networkidle" });
  await pageMobile.waitForTimeout(1500);

  // Scroll to about links mobile
  await pageMobile.evaluate(() => {
    document
      .querySelector(".about-links-block")
      ?.scrollIntoView({ behavior: "auto", block: "center" });
  });
  await pageMobile.waitForTimeout(800);
  await pageMobile.screenshot({ path: "screenshots/about-links-mobile.png" });

  // Scroll to contact mobile
  await pageMobile.evaluate(() => {
    document
      .getElementById("contact")
      ?.scrollIntoView({ behavior: "auto", block: "start" });
  });
  await pageMobile.waitForTimeout(1200);

  // Confirm opacity
  const gmailOpacity = await pageMobile.evaluate(() => {
    const el = document.querySelector(".gmail-contact");
    return el ? parseFloat(getComputedStyle(el).opacity) : 0;
  });
  if (gmailOpacity < 0.95) {
    console.warn(
      `Mobile Gmail card opacity is ${gmailOpacity}, expected >= 0.95`,
    );
  }

  await pageMobile.screenshot({ path: "screenshots/gmail-contact-mobile.png" });

  // Navigation about mobile
  await pageMobile.evaluate(() => {
    document.querySelector('.mobile-nav a[href="#about"]')?.click();
  });
  await pageMobile.waitForTimeout(1000);
  await pageMobile.screenshot({ path: "screenshots/navigation-about-mobile.png" });

  await contextMobile.close();
  await browser.close();
  console.log("Screenshots captured");
})();
