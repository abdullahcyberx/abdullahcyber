# Navigation and Responsive Keyboard Test Report

## Result

All final checks passed.

## Navigation checks

- Floating cosmic desktop navigation loads without horizontal overflow.
- Home, About, Experience and Projects links work.
- The More menu opens and closes correctly.
- More menu links point to Skills, Certifications, Education, Achievements, CV, GitHub and LinkedIn.
- `Ctrl + K` and the Explore button open the command palette.
- Command search filters to the matching destination.
- Arrow-key/Enter navigation and Escape closing are supported.
- Shehzada's AI opens from the desktop navigation and mobile dock.
- The mobile More button opens a bottom sheet and closes correctly.
- Active-section highlighting and the top scroll-progress indicator are enabled.

## Keyboard checks

- 18 skill keys are present and interactive.
- Mobile uses a responsive three-column touch grid instead of a clipped, scaled desktop keyboard.
- Very narrow screens switch to two columns.
- Tablet and compact desktop layouts retain the 3D perspective while staying inside the viewport.
- Skill selection updates the details panel correctly.

## Tested viewports

- 390 × 844 mobile
- 412 × 915 mobile
- 1024 × 768 tablet/small desktop
- 1280 × 800 desktop
- 1440 × 1000 desktop

Every viewport passed checks for horizontal overflow, keyboard bounds, navigation controls, command filtering, AI opening, and JavaScript errors. The AI knowledge self-test also passed at every viewport.
