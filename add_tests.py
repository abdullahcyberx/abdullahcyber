import re

with open('tests/site-smoke.spec.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

new_tests = r'''
  test('Exhaustive Local AI and Back-To-Top requirements', async ({ page, isMobile }) => {
    await page.goto('/');

    // 1. Back to Top Exhaustive
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    const btt = page.locator('#back-to-top');
    await btt.click();
    await page.waitForTimeout(500);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
    expect(page.url()).not.toContain('#page-top');

    // 2. Open AI
    const aiToggle = page.locator('#ai-toggle');
    await aiToggle.click();
    const aiPanel = page.locator('#ai-assistant');
    await expect(aiPanel).toHaveClass(/open/);

    // 3. AI Exhaustive Content Tests
    const aiInput = page.locator('#ai-input');
    const aiForm = page.locator('#ai-form');
    const aiMessages = page.locator('#ai-messages');

    const queries = [
      "Who is Muhammad?",
      "What does he specialize in?",
      "What are his strongest skills?",
      "Does he know Python?",
      "Show his strongest projects.",
      "Explain the Modular Recon Tool.",
      "What tools did he use?",
      "Compare it with his web-security project.",
      "What experience does he have?",
      "Why should I hire him?",
      "Is he suitable for a SOC internship?",
      "Which certifications matter most?",
      "Tell me about his achievements.",
      "What is reconnaissance?",
      "How can I contact him?",
      "Tell me more.",
      "What about his internships?",
      "What is the weather today?"
    ];

    for (const q of queries) {
      await aiInput.fill(q);
      await aiInput.press('Enter');
      // Wait for status bubble to disappear
      await expect(aiMessages.locator('.status')).toHaveCount(0, { timeout: 5000 });
      // Wait for typing to finish
      await expect(aiInput).not.toBeDisabled({ timeout: 5000 });
      
      const lastAiMessage = aiMessages.locator('.ai-message.ai:not(.status)').last();
      const text = await lastAiMessage.textContent();
      expect(text.length).toBeGreaterThan(10);
      expect(text).not.toContain('undefined');
      expect(text).not.toContain('null');
      expect(text).not.toContain('[object Object]');
    }

    // Weather fallback check
    const lastMsg = await aiMessages.locator('.ai-message.ai:not(.status)').last().textContent();
    expect(lastMsg).toContain("portfolio"); // the fallback mentions portfolio

    // Malicious HTML check
    await aiInput.fill('<script>alert(1)</script>');
    await aiInput.press('Enter');
    await expect(aiInput).not.toBeDisabled({ timeout: 5000 });
    const userMsg = await aiMessages.locator('.ai-message.user').last().textContent();
    expect(userMsg).toContain('<script>alert(1)</script>'); // rendered as text

    // /clear check
    await aiInput.fill('/clear');
    await aiInput.press('Enter');
    const count = await aiMessages.locator('.ai-message.ai').count();
    expect(count).toBe(1); // Only greeting remains
  });
'''

# Insert inside the Portfolio Smoke Tests describe block
if "test('Exhaustive Local AI and Back-To-Top requirements'" not in content:
    content = content.replace("});\n", new_tests + "});\n", 1)

with open('tests/site-smoke.spec.mjs', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added exhaustive tests")
