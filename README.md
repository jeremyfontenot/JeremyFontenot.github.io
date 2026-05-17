# Jeremy Fontenot — Portfolio + Documentation Hub

This repository contains a static portfolio site and a searchable documentation hub that surfaces artifacts from the `/docs` folder.

Quick start (serve locally):

```bash
# from repository root
python -m http.server 8000
# then open http://localhost:8000
```

Regenerate `docs/manifest.json` from the current `/docs` tree:

```bash
python tools/generate_manifest.py
```

Deploy: push to GitHub and enable GitHub Pages (serve from the `main` branch or `gh-pages`).
