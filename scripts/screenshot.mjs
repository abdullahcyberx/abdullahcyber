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

  // Scroll to about
  await pageDesktop.evaluate(() => {
    document
      .getElementById("about")
      ?.scrollIntoView({ behavior: "auto", block: "start" });
  });
  await pageDesktop.waitForTimeout(800);
  await pageDesktop.screenshot({
    path: "screenshots/cleanup-desktop-about.png",
  });

  // Scroll to projects
  await pageDesktop.evaluate(() => {
    document
      .getElementById("projects")
      ?.scrollIntoView({ behavior: "auto", block: "start" });
  });
  await pageDesktop.waitForTimeout(800);
  await pageDesktop.screenshot({
    path: "screenshots/cleanup-desktop-projects.png",
  });

  await contextDesktop.close();

  // Mobile
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto("http://localhost:4173", { waitUntil: "networkidle" });
  await pageMobile.waitForTimeout(1500);
  await pageMobile.screenshot({ path: "screenshots/cleanup-mobile-hero.png" });

  // Mobile projects
  await pageMobile.evaluate(() => {
    document
      .getElementById("projects")
      ?.scrollIntoView({ behavior: "auto", block: "start" });
  });
  await pageMobile.waitForTimeout(600);
  await pageMobile.screenshot({
    path: "screenshots/cleanup-mobile-projects.png",
  });

  // Mobile about
  await pageMobile.evaluate(() => {
    document
      .getElementById("about")
      ?.scrollIntoView({ behavior: "auto", block: "start" });
  });
  await pageMobile.waitForTimeout(600);
  await pageMobile.screenshot({ path: "screenshots/cleanup-mobile-about.png" });

  // Mobile contact
  await pageMobile.evaluate(() => {
    document
      .getElementById("contact")
      ?.scrollIntoView({ behavior: "auto", block: "start" });
  });
  await pageMobile.waitForTimeout(600);
  await pageMobile.screenshot({
    path: "screenshots/cleanup-mobile-contact.png",
  });

  // Mobile menu
  await pageMobile.evaluate(() => window.scrollTo(0, 0));
  await pageMobile.waitForTimeout(300);
  await pageMobile.click("#mobile-menu-trigger");
  await pageMobile.waitForTimeout(500);
  await pageMobile.screenshot({ path: "screenshots/cleanup-mobile-menu.png" });
  await pageMobile.click("#mobile-menu-close");
  await pageMobile.waitForTimeout(300);

  await contextMobile.close();
  await browser.close();
  console.log("Screenshots captured: cleanup-* series");
})();
