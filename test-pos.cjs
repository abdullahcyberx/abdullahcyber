const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(1000);
  await page.click('.desktop-nav a[href="#about"]');
  await page.waitForTimeout(1000);
  const hb = await page.evaluate(() => document.querySelector('.site-header').getBoundingClientRect().bottom);
  const at = await page.evaluate(() => document.querySelector('#about [data-section-anchor]').getBoundingClientRect().top);
  const st = await page.evaluate(() => document.querySelector('#about').getBoundingClientRect().top);
  console.log('headerBottom:', hb);
  console.log('anchorTop:', at);
  console.log('sectionTop:', st);
  await browser.close();
})();
