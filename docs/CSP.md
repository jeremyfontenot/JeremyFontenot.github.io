Content-Security-Policy (CSP) recommendations for GitHub Pages deployment

- Serve these headers via your hosting or a reverse proxy when possible.
- Example strict policy to include in responses or server settings:

  Content-Security-Policy: default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';

- Notes:
  - GitHub Pages does not allow custom response headers directly; consider a Cloudflare Worker or reverse proxy to add CSP.
  - Avoid `unsafe-eval` and `unsafe-inline` for scripts. Inline JSON-LD is allowed for structured data.
