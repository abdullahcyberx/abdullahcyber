import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

back_to_top = r'''  /* -------------------------
     Back to Top
     ------------------------- */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Close mobile menu
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && mobileMenu.classList.contains('open') && typeof window.closeMenuMobile === 'function') {
        window.closeMenuMobile({ restoreFocus: false });
      }

      // Close AI panel
      const aiPanel = document.getElementById('ai-assistant');
      if (aiPanel && aiPanel.classList.contains('open')) {
        const closeBtn = document.getElementById('ai-close') || document.querySelector('[data-ai-close]');
        if (closeBtn) closeBtn.click();
      }

      // Close Certificate Viewer
      const certViewer = document.getElementById('cert-viewer');
      if (certViewer && certViewer.classList.contains('open')) {
        const certClose = document.getElementById('cert-viewer-close');
        if (certClose) certClose.click();
      }

      // Close Case-study Modal
      const modal = document.querySelector('dialog[open]');
      if (modal && typeof modal.close === 'function') {
        modal.close();
      }

      // Strip overlay classes just in case
      document.body.classList.remove('menu-open', 'ai-open', 'cert-viewer-open', 'modal-open');
      document.body.style.overflow = '';

      // Scroll to top safely
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      // Strip hash from URL
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      
      // Restore focus to body to reset sequential navigation
      document.body.setAttribute('tabindex', '-1');
      document.body.focus({ preventScroll: true });
      document.body.removeAttribute('tabindex');
    });
  }
})();
'''

content = re.sub(r'/\* -+\s+Back to Top\s+-+ \*/.*?}\s*\)\(\);\s*$', back_to_top, content, flags=re.DOTALL)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Back to top")
