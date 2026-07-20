import re

with open('src/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# The CSS block provided by the user
new_css = """/* =========================================================
   SHEHZADA AI — AUTHORITATIVE PRESENTATION LAYER
   ========================================================= */

.ai-launcher {
  position: fixed;
  right: max(20px, env(safe-area-inset-right));
  bottom: max(20px, env(safe-area-inset-bottom));
  z-index: 2100;
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  background: rgba(19, 19, 22, 0.94);
  color: var(--text, #f5f5f5);
  font: inherit;
  font-size: 0.86rem;
  font-weight: 650;
  cursor: pointer;
  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.42),
    inset 0 1px rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease;
}

.ai-launcher:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(25, 25, 29, 0.98);
}

.ai-launcher:focus-visible,
.ai-icon-button:focus-visible,
.ai-send-button:focus-visible,
.ai-starter-grid button:focus-visible,
.ai-chip:focus-visible {
  outline: 2px solid var(--accent, #d8ff4f);
  outline-offset: 3px;
}

.ai-launcher-symbol {
  color: var(--accent, #d8ff4f);
  font-size: 1rem;
}

body.ai-open .ai-launcher,
body.menu-open .ai-launcher,
body.cert-viewer-open .ai-launcher {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.ai-assistant {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: grid;
  place-items: end;
  padding: 16px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 180ms ease,
    visibility 180ms ease;
}

.ai-assistant.open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.ai-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: rgba(4, 4, 6, 0.68);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: default;
}

.ai-panel {
  position: relative;
  width: min(440px, calc(100vw - 32px));
  height: min(720px, calc(100dvh - 32px));
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 18px;
  background: #101013;
  color: #f4f4f5;
  box-shadow:
    0 32px 100px rgba(0, 0, 0, 0.62),
    inset 0 1px rgba(255, 255, 255, 0.05);
  transform: translateY(14px);
  opacity: 0;
  transition:
    width 220ms cubic-bezier(0.22, 1, 0.36, 1),
    height 220ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 180ms ease,
    opacity 180ms ease,
    border-radius 220ms ease;
}

.ai-assistant.open .ai-panel {
  transform: translateY(0);
  opacity: 1;
}

.ai-assistant.is-maximized {
  place-items: center;
}

.ai-assistant.is-maximized .ai-panel {
  width: min(1440px, calc(100vw - 32px));
  height: calc(100dvh - 32px);
}

.ai-header {
  min-width: 0;
  min-height: 74px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(16, 16, 19, 0.96);
}

.ai-identity {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-identity-mark {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid rgba(216, 255, 79, 0.2);
  border-radius: 11px;
  background: rgba(216, 255, 79, 0.08);
  color: var(--accent, #d8ff4f);
}

.ai-identity-copy {
  min-width: 0;
}

.ai-identity-copy h2 {
  margin: 0;
  color: #f7f7f8;
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.ai-identity-copy p {
  margin: 3px 0 0;
  overflow: hidden;
  color: #8d8d96;
  font-size: 0.74rem;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-header-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-icon-button {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #a4a4ad;
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
}

.ai-icon-button:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.055);
  color: #ffffff;
}

.ai-close-button:hover {
  border-color: rgba(255, 110, 110, 0.18);
  background: rgba(255, 90, 90, 0.08);
  color: #ffb0b0;
}

.ai-restore-icon {
  display: none;
}

.ai-assistant.is-maximized .ai-maximize-icon {
  display: none;
}

.ai-assistant.is-maximized .ai-restore-icon {
  display: block;
}

.ai-conversation {
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
  background:
    radial-gradient(
      circle at 50% 0%,
      rgba(216, 255, 79, 0.025),
      transparent 35%
    ),
    #0d0d10;
}

.ai-content-column {
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
}

.ai-welcome {
  padding: 34px 22px 22px;
  text-align: center;
}

.ai-welcome[hidden] {
  display: none;
}

.ai-welcome-mark {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  border: 1px solid rgba(216, 255, 79, 0.2);
  border-radius: 14px;
  background: rgba(216, 255, 79, 0.07);
  color: var(--accent, #d8ff4f);
  font-size: 1.1rem;
}

.ai-welcome h3 {
  margin: 0;
  color: #f5f5f6;
  font-size: clamp(1.18rem, 2vw, 1.45rem);
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.ai-welcome > p {
  max-width: 520px;
  margin: 10px auto 0;
  color: #96969f;
  font-size: 0.88rem;
  line-height: 1.6;
}

.ai-starter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 24px;
}

.ai-starter-grid button {
  min-width: 0;
  min-height: 74px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  padding: 12px 13px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
  color: #f0f0f2;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;
}

.ai-starter-grid button:hover {
  transform: translateY(-1px);
  border-color: rgba(216, 255, 79, 0.22);
  background: rgba(216, 255, 79, 0.045);
}

.ai-starter-grid strong {
  font-size: 0.8rem;
  font-weight: 650;
}

.ai-starter-grid span {
  color: #80808a;
  font-size: 0.7rem;
  line-height: 1.35;
}

.ai-messages {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
}

.ai-message {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  opacity: 0;
  transform: translateY(5px);
  animation: ai-message-enter 180ms ease forwards;
}

.ai-message.ai-user {
  justify-content: flex-end;
}

.ai-message-avatar {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  margin-top: 2px;
  border: 1px solid rgba(216, 255, 79, 0.17);
  border-radius: 9px;
  background: rgba(216, 255, 79, 0.06);
  color: var(--accent, #d8ff4f);
  font-size: 0.72rem;
}

.ai-bubble {
  min-width: 0;
  max-width: min(78%, 700px);
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.085);
  border-radius: 4px 14px 14px 14px;
  background: #17171b;
  color: #d9d9de;
  font-size: 0.88rem;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.ai-user .ai-bubble {
  max-width: min(74%, 650px);
  border-color: rgba(216, 255, 79, 0.18);
  border-radius: 14px 14px 4px 14px;
  background: rgba(216, 255, 79, 0.095);
  color: #f5f7eb;
}

.ai-bubble p {
  margin: 0;
}

.ai-bubble p + p {
  margin-top: 10px;
}

.ai-bubble strong {
  color: #ffffff;
  font-weight: 650;
}

.ai-bubble code {
  padding: 0.12em 0.35em;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.22);
  color: #e3ff8d;
  font-size: 0.9em;
}

.ai-thinking {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 20px;
}

.ai-thinking span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #85858e;
  animation: ai-thinking-dot 900ms infinite ease-in-out;
}

.ai-thinking span:nth-child(2) {
  animation-delay: 120ms;
}

.ai-thinking span:nth-child(3) {
  animation-delay: 240ms;
}

.ai-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 0 22px 22px;
}

.ai-suggestions:empty {
  display: none;
}

.ai-chip {
  min-height: 36px;
  padding: 8px 11px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.025);
  color: #a8a8b1;
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
}

.ai-chip:hover {
  border-color: rgba(216, 255, 79, 0.22);
  color: #e9f7bc;
}

.ai-composer-shell {
  border-top: 1px solid rgba(255, 255, 255, 0.09);
  background: #111114;
  padding: 12px 14px 10px;
}

.ai-composer {
  min-width: 0;
  display: flex;
  align-items: flex-end;
  gap: 9px;
  padding: 7px 7px 7px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: #19191d;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.ai-composer:focus-within {
  border-color: rgba(216, 255, 79, 0.35);
  box-shadow: 0 0 0 3px rgba(216, 255, 79, 0.06);
}

.ai-composer textarea {
  min-width: 0;
  width: 100%;
  max-height: 130px;
  min-height: 38px;
  resize: none;
  overflow-y: auto;
  padding: 9px 0 7px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #f3f3f5;
  font: inherit;
  font-size: 0.88rem;
  line-height: 1.45;
}

.ai-composer textarea::placeholder {
  color: #73737d;
}

.ai-send-button {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 11px;
  background: var(--accent, #d8ff4f);
  color: #0b0c08;
  cursor: pointer;
  transition:
    transform 160ms ease,
    opacity 160ms ease;
}

.ai-send-button:hover {
  transform: translateY(-1px);
}

.ai-send-button:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  transform: none;
}

.ai-composer-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 7px 3px 0;
  color: #696973;
  font-size: 0.64rem;
  line-height: 1.3;
}

#ai-char-count {
  white-space: nowrap;
}

#ai-char-count:not(.is-near-limit) {
  opacity: 0;
}

@keyframes ai-message-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes ai-thinking-dot {
  0%,
  60%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@media (max-width: 768px) {
  .ai-launcher {
    right: max(14px, env(safe-area-inset-right));
    bottom: max(14px, env(safe-area-inset-bottom));
    min-width: 50px;
    min-height: 50px;
    justify-content: center;
    padding: 0;
  }

  .ai-launcher-label {
    display: none;
  }

  .ai-assistant {
    place-items: stretch;
    padding: 0;
  }

  .ai-panel,
  .ai-assistant.is-maximized .ai-panel {
    width: 100%;
    height: 100dvh;
    max-width: none;
    max-height: none;
    border: 0;
    border-radius: 0;
  }

  .ai-maximize-button {
    display: none;
  }

  .ai-header {
    min-height: calc(68px + env(safe-area-inset-top));
    padding:
      calc(10px + env(safe-area-inset-top))
      max(10px, env(safe-area-inset-right))
      10px
      max(14px, env(safe-area-inset-left));
  }

  .ai-icon-button {
    width: 40px;
    height: 40px;
  }

  .ai-welcome {
    padding: 26px 16px 18px;
  }

  .ai-starter-grid {
    grid-template-columns: 1fr;
  }

  .ai-starter-grid button {
    min-height: 62px;
  }

  .ai-messages {
    gap: 15px;
    padding: 18px 14px;
  }

  .ai-bubble {
    max-width: 88%;
    font-size: 0.85rem;
  }

  .ai-user .ai-bubble {
    max-width: 86%;
  }

  .ai-suggestions {
    padding: 0 14px 16px;
  }

  .ai-composer-shell {
    padding:
      10px
      max(10px, env(safe-area-inset-right))
      calc(8px + env(safe-area-inset-bottom))
      max(10px, env(safe-area-inset-left));
  }

  .ai-composer-meta span:first-child {
    display: none;
  }

  .ai-composer-meta {
    justify-content: flex-end;
  }
}

@media (max-width: 360px) {
  .ai-identity-copy p {
    max-width: 145px;
  }

  .ai-header-actions {
    gap: 0;
  }

  .ai-welcome h3 {
    font-size: 1.08rem;
  }

  .ai-bubble {
    max-width: 92%;
  }

  .ai-user .ai-bubble {
    max-width: 90%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-assistant,
  .ai-panel,
  .ai-launcher,
  .ai-message,
  .ai-thinking span {
    animation: none !important;
    transition: none !important;
  }
}
"""

# Remove all existing .ai-* rules from the original CSS
# Also remove body.ai-open etc.
# We can use a regex to match CSS blocks containing .ai- or body.ai-open
css = re.sub(r'([^{\n]*(?:\.ai-|\[data-ai-open\]|body\.contact-visible|body\.ai-open|body\.menu-open|body\.cert-viewer-open)[^{\n]*)\s*\{[^\}]*\}', '', css)

# Make sure we don't accidentally remove @media blocks entirely if they become empty, 
# but it's simpler to just append the new CSS at the end.
css = css + '\n\n' + new_css

# clean up empty @media blocks
css = re.sub(r'@media[^{]+\{\s*\}', '', css)

with open('src/style.css', 'w', encoding='utf-8') as f:
    f.write(css)
