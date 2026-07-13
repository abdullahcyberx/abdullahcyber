import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8788',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'Mobile 360', use: { ...devices['Pixel 5'], viewport: { width: 360, height: 800 } } },
    { name: 'Mobile 390', use: { ...devices['iPhone 12'], viewport: { width: 390, height: 844 } } },
    { name: 'Mobile 412', use: { ...devices['Pixel 7'], viewport: { width: 412, height: 915 } } },
    { name: 'Tablet 768', use: { ...devices['iPad Mini'], viewport: { width: 768, height: 1024 } } },
    { name: 'Desktop 1024', use: { viewport: { width: 1024, height: 768 } } },
    { name: 'Desktop 1280', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'Desktop 1440', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npx wrangler pages dev dist',
    port: 8788,
    reuseExistingServer: !process.env.CI,
  },
});
