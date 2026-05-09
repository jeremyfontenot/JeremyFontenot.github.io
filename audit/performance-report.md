# Performance Report (summary)

## Observations
- Tailwind CDN used (fast for dev; consider building CSS for production to reduce unused CSS).
- Inline SVG placeholders used to avoid external image requests.
- JS is minimal; no heavy frameworks.

## Recommendations
- For production, build a minimized Tailwind CSS bundle to reduce CSS size.
- Add caching headers via hosting configuration (GitHub Pages or CDN).