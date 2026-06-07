---
name: systematic-review-wizard
description: Orchestrate the full 8-step PRISMA systematic review workflow in the Review Paper Writer app. Use when guiding users through topic selection, search, screening, extraction, and manuscript generation.
---

# Systematic Review Wizard

## Workflow Steps

1. **Research Question** — Generate topic ideas via `/api/gemini/generate`, select topic
2. **Search Strategy** — AI builds Boolean query from topic
3. **Database Search** — Parallel search via `/api/search/unified` (PubMed, OpenAlex, Semantic Scholar, Scopus, WoS)
4. **Inclusion Criteria** — AI drafts PICO criteria
5. **PRISMA Selection** — AI screens via `/api/gemini/screen`, manual override
6. **Quality Appraisal** — JBI/CASP/MMAT checklists
7. **Data Extraction** — AI extracts via `/api/gemini/extract`
8. **Synthesis & Writing** — Generate manuscript sections with citation audit

## Data Model

Project state in `src/types/project.ts` — `ReviewProject` with `records`, `prisma`, `extractions`, `manuscript`.

## API Routes

- `POST /api/gemini/generate` — topic ideas, writing, critique
- `POST /api/gemini/screen` — title/abstract screening
- `POST /api/gemini/extract` — structured extraction
- `POST /api/search/unified` — multi-database search

## Citation Rule

Every claim must map to a retrieved `StudyRecord`. Block export if citations unverified.
