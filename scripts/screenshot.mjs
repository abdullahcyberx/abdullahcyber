import { chromium } from '@playwright/test';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();

  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  const prefix = process.argv[2] || 'before';

  // Mobile
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(1200);
  await pageMobile.screenshot({ path: `screenshots/${prefix}-mobile-hero.png` });

  await pageMobile.evaluate(() => window.scrollBy(0, 800));
  await pageMobile.waitForTimeout(500);
  await pageMobile.screenshot({ path: `screenshots/${prefix}-mobile-scroll.png` });

  await pageMobile.click('#mobile-menu-trigger');
  await pageMobile.waitForTimeout(500);
  await pageMobile.screenshot({ path: `screenshots/${prefix}-mobile-menu.png` });
  await pageMobile.click('#mobile-menu-close');

  // Desktop
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const pageDesktop = await contextDesktop.newPage();
  await pageDesktop.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await pageDesktop.waitForTimeout(1200);
  await pageDesktop.screenshot({ path: `screenshots/${prefix}-desktop-hero.png` });

  await pageDesktop.evaluate(() => window.scrollBy(0, 800));
  await pageDesktop.waitForTimeout(500);
  await pageDesktop.screenshot({ path: `screenshots/${prefix}-desktop-scroll.png` });

  await pageDesktop.evaluate(() => window.scrollBy(0, 2000));
  await pageDesktop.waitForTimeout(500);
  await pageDesktop.screenshot({ path: `screenshots/${prefix}-desktop-projects.png` });

  await browser.close();
  console.log(`Screenshots captured for ${prefix}`);
})();
