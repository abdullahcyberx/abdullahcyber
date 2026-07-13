# Design Report: Premium Dark Editorial Redesign

## 1. Visual Direction & Identity
The portfolio has been completely overhauled from a "cosmic dashboard" theme into a mature, premium dark editorial layout. The focus is now strictly on oversized typography, vast negative space, and a clear information hierarchy, drawing inspiration from high-end digital design (e.g., surendarselvaraj.com) while remaining unique to the Abdullah Cyber identity.

- **Typography Stack**:
  - `Space Grotesk` (geometric sans) is utilized for oversized headings, enforcing a sharp, technical, yet editorial look.
  - `Inter` (neutral neo-grotesque) provides exceptional readability for body copy.
  - `clamp()` scaling ensures fluid font sizes across devices, allowing headings to reach up to `10rem` on desktop while remaining compact on mobile.

- **Color Palette**:
  - The background is a stark, almost-black navy (`#08090b`), stripped of all previous glowing radar effects and particle fields.
  - The primary accent is a restrained, muted violet (`#9b7cff`), used sparingly for hover states, key links, and timeline accents to maintain the cybersecurity identity.
  - Text relies on a high-contrast off-white (`#f4f3ee`) for primary headings, stepping down to cool grays (`#777b78`) for context lines and metadata.

## 2. Structural & Layout Decisions

- **Navigation**:
  - Replaced the floating glass capsule with a flush, full-width sticky header.
  - It darkens via a subtle backdrop blur (`rgba(8, 9, 11, 0.85)`) only when scrolling past `50px`.
  - The mobile navigation is a full-screen, clean overlay rather than a bottom dock, preventing overlap with browser UI and increasing tap target areas.

- **Hero Layout**:
  - Moved away from a split-screen (text + cosmic core) to a dominant, asymmetrical typography stack spanning the viewport.
  - Context lines (e.g., location, title) are offset and separated by horizontal rules to establish a clear reading pattern before diving into the main copy.

- **Selected Work (Projects)**:
  - Transformed from grid cards into an editorial numbered list format (`<li>` rows).
  - Each project is separated by thin, low-opacity borders (`rgba(255, 255, 255, 0.07)`).
  - Desktop hover interactions now reveal a floating project image tied to the cursor, providing visual context without cluttering the initial layout.

- **Content Integration**:
  - All original JSON structures (`content/*.json`) were fully preserved. The template logic in `render-site.mjs` was modified to output the new DOM elements (e.g., `.timeline-row`, `.project-row`, `.supp-cert-row`).

## 3. Motion System

- **Restrained Animation**:
  - The continuous, ambient CSS animations (orbit rings, radar sweeps, pulsing glows) have been entirely removed.
  - Replaced with a single, performant `IntersectionObserver` system. Elements tagged with `.reveal` smoothly translate upward (`24px`) and fade in over `650ms` when entering the viewport.
  - Hover transitions (`var(--motion-fast)`, `180ms`) use a sharp `cubic-bezier(0.22, 1, 0.36, 1)` to feel snappy and responsive.

## 4. Performance & Reliability

- **DOM Reduction**: By removing the complex `.cosmic-core` nodes and its associated `rafPointerEffect` tracking logic in `main.js`, the layout calculations and painting workload have been drastically reduced.
- **Accessibility**: 
  - Contrast ratios pass WCAG AA standards.
  - Interactive elements (modals, AI toggle, new mobile menu) correctly update ARIA states and manage focus.
  - Full support for `prefers-reduced-motion: reduce`, ensuring all fades and transforms are instantly resolved for users with vestibular disorders.
- **Validation**: Playwright end-to-end tests were updated to target the new `.skills-keyboard`, `#mobile-menu-trigger`, and `.cert-card a` elements, confirming 100% test passage.
