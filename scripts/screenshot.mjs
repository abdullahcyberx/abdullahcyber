import { chromium } from '@playwright/test';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();

  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  // Desktop
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const pageDesktop = await contextDesktop.newPage();
  await pageDesktop.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await pageDesktop.waitForTimeout(1500);
  await pageDesktop.screenshot({ path: 'screenshots/final-black-desktop-hero.png', fullPage: false });

  // Scroll to projects
  await pageDesktop.evaluate(() => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
  await pageDesktop.waitForTimeout(800);
  await pageDesktop.screenshot({ path: 'screenshots/final-black-desktop-projects.png' });

  // Scroll to skills
  await pageDesktop.evaluate(() => {
    document.getElementById('skills')?.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
  await pageDesktop.waitForTimeout(800);
  await pageDesktop.screenshot({ path: 'screenshots/final-black-desktop-skills.png' });

  // Scroll to contact
  await pageDesktop.evaluate(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
  await pageDesktop.waitForTimeout(800);
  await pageDesktop.screenshot({ path: 'screenshots/final-black-desktop-contact.png' });

  await contextDesktop.close();

  // Mobile
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(1500);
  await pageMobile.screenshot({ path: 'screenshots/final-black-mobile-hero.png' });

  // Mobile projects
  await pageMobile.evaluate(() => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
  await pageMobile.waitForTimeout(600);
  await pageMobile.screenshot({ path: 'screenshots/final-black-mobile-projects.png' });

  // Mobile menu
  await pageMobile.evaluate(() => window.scrollTo(0, 0));
  await pageMobile.waitForTimeout(300);
  await pageMobile.click('#mobile-menu-trigger');
  await pageMobile.waitForTimeout(500);
  await pageMobile.screenshot({ path: 'screenshots/final-black-mobile-menu.png' });
  await pageMobile.click('#mobile-menu-close');
  await pageMobile.waitForTimeout(300);

  await contextMobile.close();
  await browser.close();
  console.log('Screenshots captured: final-black-* series');
})();
