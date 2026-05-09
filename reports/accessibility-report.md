# Accessibility Report (summary)

## Automated checks performed
- Skip link present.
- Semantic headings used (h1-h3).
- Focusable interactive elements have visible focus styles.
- Reduced motion respected via CSS.
- Alt text provided for placeholder images.

## Issues to review manually
- Color contrast: primary accent on dark background meets WCAG AA for large text; verify small text contrast for specific combinations.
- Keyboard focus order: test with screen reader and keyboard navigation across all pages.
- Form labels: contact form includes labels; ensure server-side validation messages are accessible.

## Recommendations
- Run Lighthouse accessibility audit and address any flagged issues.
- Add ARIA live regions for dynamic content if adding interactive widgets.