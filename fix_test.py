import re

with open('tests/site-smoke.spec.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove voice references
content = re.sub(r'\s*const voiceInput = page\.locator\("#ai-voice-input"\);\s*', '\n', content)
content = re.sub(r'\s*const voiceOutput = page\.locator\("#ai-voice-output"\);\s*', '\n', content)
content = re.sub(r'\s*await voiceInput\.focus\(\{ force: true \}\)\.catch\(\(\) => \{\}\);\s*', '\n', content)
content = re.sub(r'\s*await expect\(voiceInput\)\.not\.toBeFocused\(\);\s*', '\n', content)
content = re.sub(r'\s*// Voice APIs gracefully hidden if unsupported in playwright\s*expect\(await voiceInput\.count\(\)\)\.toBe\(1\);\s*', '\n', content)

# Update to check for maximize button
maximize_check = """
    // Verify voice buttons are gone and maximize is present
    const voiceInputCheck = page.locator("#ai-voice-input");
    expect(await voiceInputCheck.count()).toBe(0);
    const maximizeBtn = page.locator("#ai-maximize-btn");
    expect(await maximizeBtn.count()).toBe(1);
    
    // Check maximize functionality
    await maximizeBtn.click();
    await expect(aiAssistant).toHaveClass(/is-maximized/);
    await maximizeBtn.click();
    await expect(aiAssistant).not.toHaveClass(/is-maximized/);
"""
# insert before `// Escape closes panel and restores focus`
content = content.replace('    // Escape closes panel and restores focus', maximize_check + '\n    // Escape closes panel and restores focus')

with open('tests/site-smoke.spec.mjs', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated site-smoke.spec.mjs successfully.")
