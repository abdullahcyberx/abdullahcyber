import re

with open('tests/site-smoke.spec.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# Add scroll to the beginning of AI tests to make sure the float button is visible on mobile
scroll_code = "await page.goto(\"/\");\n      await page.evaluate(() => document.getElementById(\"about\")?.scrollIntoView());\n      await page.waitForTimeout(500);"

content = content.replace('await page.goto("/");\n      await page.waitForTimeout(500);\n\n      // Open AI', scroll_code + '\n\n      // Open AI')
content = content.replace('await page.goto("/");\n      await page.waitForTimeout(1000);\n\n      await page.locator(\'[data-ai-open]\').click();', scroll_code + '\n\n      await page.locator(\'[data-ai-open]\').click();')

with open('tests/site-smoke.spec.mjs', 'w', encoding='utf-8') as f:
    f.write(content)
