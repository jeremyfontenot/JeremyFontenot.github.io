# Jeremy Fontenot - Portfolio + Documentation Intelligence Hub

This repository is a static, client-side portfolio and documentation intelligence system. It demonstrates a personal portfolio alongside a structured, searchable knowledge system with deterministic behavior, integrity validation, and privacy-safe analytics.

It includes:

- A personal portfolio site
- A searchable documentation hub
- A deterministic semantic search engine
- A CI-backed integrity validation pipeline
- A privacy-preserving, client-side analytics layer
- A read-only search quality evaluation dashboard

## Core capabilities

### Searchable Documentation Hub

- Indexes curated documentation from `/docs`
- Supports semantic, weighted search ranking
- Deduplicates results and enforces canonical document structure
- Returns consistent, deterministic results across sessions

### Semantic Search Engine

- Weighted scoring across title, display title, tags and categories, path context, and body content
- Exact phrase and prefix boosting
- Fully deterministic ranking, with no probabilistic model in the loop

### Curated Corpus Boundary

- Only curated documentation is indexed
- Archive content is excluded from production search
- Search behavior stays stable and intentional over time

### CI Integrity System

- Validates manifest generation
- Detects duplicates, orphaned documents, and structural issues
- Enforces mode-based validation from lenient to release
- Runs scheduled release audits via GitHub Actions

### Privacy-Safe Analytics Layer

- Client-side only, with no server dependency
- Stores anonymized search events with hashed query identity, intent/domain bucket classification, and result counts
- No raw queries are persisted

### Search Quality Evaluation Dashboard

Accessible via `system.html`, this dashboard provides:

- Zero-result rate analysis
- Success rate by intent/domain
- Result distribution metrics
- 7-day performance trend tracking

## System design principles

- Deterministic behavior, with no random or ML-based ranking
- Read-only analytics, with no feedback loop into ranking
- Client-side execution, with no backend dependency
- Curated data boundary, with a controlled corpus only
- Schema stability, with version-safe telemetry and manifests

## Quick start

Run locally:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

Regenerate `docs/manifest.json` from the current `/docs` tree:

```bash
python tools/generate_manifest.py
```

Deploy by pushing to GitHub and letting GitHub Pages publish from the `main` branch.
