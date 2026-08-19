import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(1000);
  
  const link = page.locator('.desktop-nav a[href="#projects"]');
  await link.click();
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
