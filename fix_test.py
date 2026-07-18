import re

with open('tests/site-smoke.spec.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const messageCount = await page.locator('.ai-message').count();\n      // Should just be greeting (and possibly privacy msg)\n      expect(messageCount).toBeLessThanOrEqual(2);", "await expect(page.locator('.ai-message')).toHaveCount(1, { timeout: 2000 });")

# Some setups might have privacy msg, so let's allow 1 or 2 using evaluate retry if needed, but the clear logic only adds 1 message. 
# In processQuery('/clear'): createMessageBubble('ai').innerHTML = aiConfig.greeting...
# It only adds 1 message, regardless of privacy msg (which is only added in openAi).

with open('tests/site-smoke.spec.mjs', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed test")
