# Systematic Review Paper Writer

AI-assisted systematic review tool for academic teams. Guides you through an 8-step PRISMA workflow with citation-backed manuscript generation.

## Features

- **8-Step PRISMA Wizard** — Research question → Search → Screening → Extraction → Manuscript
- **12 Academic Toolkit Modules** — Topic generation, gap analysis, methodology, discussion, quality check
- **Multi-Database Search** — PubMed, OpenAlex, Semantic Scholar, Scopus, Web of Science, Gemini web search
- **AI Screening & Extraction** — Gemini-powered title/abstract screening and data extraction
- **Citation Audit** — Blocks export until claims are backed by retrieved studies
- **Team Mode** — Step assignments for 2-person teams
- **Export** — Markdown, DOCX, PRISMA flowchart PNG (300 DPI)

## Architecture

- **Frontend**: React + Vite + Tailwind → GitHub Pages
- **API**: Vercel serverless functions → Gemini, literature databases

```
Frontend (GitHub Pages)  →  Vercel API (/api/*)  →  Gemini + PubMed + OpenAlex + ...
```

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd review-paper-writer
npm install
```

### 2. Deploy API to Vercel

```bash
npx vercel
```

Set environment variables in Vercel dashboard:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key |
| `SCOPUS_API_KEY` | No | Elsevier Scopus API key |
| `WOS_API_KEY` | No | Clarivate Web of Science key |
| `ALLOWED_ORIGINS` | No | CORS origins (comma-separated) |

### 3. Configure frontend

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set your Vercel API URL:

```
VITE_API_URL=https://your-app.vercel.app
```

### 4. Run locally

```bash
# Terminal 1 — frontend
npm run dev

# Terminal 2 — API proxy
npx vercel dev
```

Open http://localhost:5173. In Settings, confirm the API URL points to `http://localhost:3000`.

### 5. Deploy frontend to GitHub Pages

1. Push to `main` branch
2. Enable GitHub Pages (Settings → Pages → GitHub Actions)
3. Set repository variable `VITE_API_URL` to your Vercel deployment URL

The workflow in `.github/workflows/deploy.yml` builds and deploys automatically.

## Team-of-2 Workflow

| Step | Suggested Owner |
|------|----------------|
| 1. Research Question | Both |
| 2. Search Strategy | Person A |
| 3. Database Search | Person A |
| 4. Inclusion Criteria | Person B |
| 5. PRISMA Screening | Person B |
| 6. Quality Appraisal | Person A |
| 7. Data Extraction | Person B |
| 8. Synthesis & Writing | Both |

Assign steps in the Steering Panel (Step 8 sidebar). Each person can work on their assigned steps independently; project state persists in browser IndexedDB.

## Optional Database Keys

Scopus and Web of Science require API keys. Provide them either:

- **Server-side**: Set `SCOPUS_API_KEY` / `WOS_API_KEY` in Vercel env
- **Session-only**: Enter keys in Settings page (stored in `sessionStorage`, never committed)

## Meta-Analysis / Systematic Review Template

The manuscript generator follows journal specifications:

- Title includes "Systematic Review" or "Meta-Analysis"
- Structured abstract (150–250 words)
- Sections: Introduction, Methods, Results, Discussion, Conclusions, Ethics, etc.
- Vancouver references (15–100)
- PRISMA flowchart exportable at 300 DPI

## Project Structure

```
├── api/                  # Vercel serverless functions
│   ├── gemini/           # Generate, screen, extract, search, analyze
│   └── search/           # PubMed, OpenAlex, Semantic Scholar, unified
├── src/
│   ├── components/       # UI, wizard steps, PRISMA, citation audit
│   ├── pages/            # Dashboard, wizard, toolkit, settings
│   ├── prompts/          # 12 academic module templates
│   ├── stores/           # Zustand + IndexedDB persistence
│   └── templates/        # Systematic review journal template
├── .cursor/skills/       # Cursor agent skills for each workflow
└── .github/workflows/    # GitHub Pages deployment
```

## Cursor Skills

Project-local skills in `.cursor/skills/` provide verbatim prompts and app integration context for:

- `systematic-review-wizard` — Full workflow orchestration
- `topic-generation`, `topic-refinement`, `gap-identification`
- `lit-review-structure`, `critical-lit-analysis`
- `methodology-adviser`, `manuscript-writer`, `literature-search`

## License

MIT
