import re
import sys

with open('src/index.template.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_html = """<!-- Shehzada AI launcher -->
<button
  class="ai-launcher"
  type="button"
  data-ai-open
  aria-label="Open Shehzada’s AI"
  aria-haspopup="dialog"
  aria-controls="ai-assistant"
>
  <span class="ai-launcher-symbol" aria-hidden="true">✦</span>
  <span class="ai-launcher-label">Ask AI</span>
</button>

<!-- Shehzada AI dialog -->
<div
  class="ai-assistant"
  id="ai-assistant"
  role="dialog"
  aria-modal="true"
  aria-labelledby="ai-assistant-title"
  aria-hidden="true"
  inert
>
  <button
    class="ai-backdrop"
    type="button"
    data-ai-close
    tabindex="-1"
    aria-label="Close Shehzada’s AI"
  ></button>

  <section class="ai-panel" aria-describedby="ai-assistant-description">
    <header class="ai-header">
      <div class="ai-identity">
        <div class="ai-identity-mark" aria-hidden="true">✦</div>

        <div class="ai-identity-copy">
          <h2 id="ai-assistant-title">Shehzada’s AI</h2>
          <p id="ai-assistant-description">
            Muhammad Abdullah’s portfolio guide
          </p>
        </div>
      </div>

      <div class="ai-header-actions">
        <button
          class="ai-icon-button"
          id="ai-clear-btn"
          type="button"
          aria-label="Clear conversation"
          title="Clear conversation"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18"></path>
            <path d="M8 6V4h8v2"></path>
            <path d="M19 6l-1 14H6L5 6"></path>
            <path d="M10 10v6"></path>
            <path d="M14 10v6"></path>
          </svg>
        </button>

        <button
          class="ai-icon-button ai-maximize-button"
          id="ai-maximize-btn"
          type="button"
          aria-label="Maximize AI assistant"
          aria-pressed="false"
          title="Maximize"
        >
          <svg
            class="ai-maximize-icon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
            <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
            <path d="M21 16v3a2 2 0 0 1-2 2h-3"></path>
            <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
          </svg>

          <svg
            class="ai-restore-icon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 4H4v5"></path>
            <path d="M15 4h5v5"></path>
            <path d="M20 15v5h-5"></path>
            <path d="M4 15v5h5"></path>
            <path d="M4 9l5-5"></path>
            <path d="M15 4l5 5"></path>
            <path d="M20 15l-5 5"></path>
            <path d="M9 20l-5-5"></path>
          </svg>
        </button>

        <button
          class="ai-icon-button ai-close-button"
          type="button"
          data-ai-close
          aria-label="Close AI assistant"
          title="Close"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12"></path>
            <path d="M18 6L6 18"></path>
          </svg>
        </button>
      </div>
    </header>

    <div class="ai-conversation" id="ai-conversation">
      <div class="ai-content-column">
        <section class="ai-welcome" id="ai-welcome">
          <div class="ai-welcome-mark" aria-hidden="true">✦</div>

          <h3>Ask about Muhammad’s work</h3>

          <p>
            Explore his cybersecurity projects, internships, skills,
            certifications and practical experience.
          </p>

          <div class="ai-starter-grid">
            <button type="button" data-ai-question="Why should someone hire Muhammad?">
              <strong>Why hire Muhammad?</strong>
              <span>Recruiter-focused summary</span>
            </button>

            <button type="button" data-ai-question="What are Muhammad’s strongest projects?">
              <strong>Strongest projects</strong>
              <span>Practical technical work</span>
            </button>

            <button type="button" data-ai-question="Explain Muhammad’s internship experience.">
              <strong>Internship experience</strong>
              <span>Roles and responsibilities</span>
            </button>

            <button type="button" data-ai-question="What are Muhammad’s main technical skills?">
              <strong>Technical skills</strong>
              <span>Tools and technologies</span>
            </button>
          </div>
        </section>

        <div
          class="ai-messages"
          id="ai-messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        ></div>

        <div class="ai-suggestions" id="ai-suggestions"></div>
      </div>
    </div>

    <footer class="ai-composer-shell">
      <div class="ai-content-column">
        <form class="ai-composer" id="ai-form">
          <textarea
            id="ai-input"
            rows="1"
            maxlength="500"
            aria-label="Message Shehzada’s AI"
            placeholder="Ask about projects, skills, internships or certifications…"
          ></textarea>

          <button
            class="ai-send-button"
            id="ai-send-btn"
            type="submit"
            aria-label="Send message"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M22 2L11 13"></path>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
            </svg>
          </button>
        </form>

        <div class="ai-composer-meta">
          <span>Local portfolio assistant · No external AI requests</span>
          <span id="ai-char-count" aria-live="polite">0 / 500</span>
        </div>
      </div>
    </footer>

    <div
      class="visually-hidden"
      id="ai-live-region"
      aria-live="polite"
    ></div>
  </section>
</div>"""

# Remove old `.ai-trigger` and `.ai-assistant` block completely.
html = re.sub(r'<!-- *Shehzada AI *(Launcher)? *-->[\s\S]*?(?=</main>|<!-- *Certificates Fullscreen Viewer *-->)', '', html, flags=re.IGNORECASE)
html = re.sub(r'<button class="ai-trigger"[\s\S]*?<div class="ai-assistant"[\s\S]*?</div>\s*</div>\s*</div>\s*</div>', '', html)

# Insert the new code before the Certificates Fullscreen Viewer
parts = html.split('<!-- Certificates Fullscreen Viewer -->')
if len(parts) == 2:
    html = parts[0] + new_html + '\n\n    <!-- Certificates Fullscreen Viewer -->' + parts[1]
else:
    # Append before closing main if comment not found
    html = html.replace('</main>', new_html + '\n  </main>')

with open('src/index.template.html', 'w', encoding='utf-8') as f:
    f.write(html)
