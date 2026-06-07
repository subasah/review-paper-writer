# Deployment Guide

This app uses **two deployments**:

| Part | Host | What it runs |
|------|------|--------------|
| Frontend | GitHub Pages | React UI (static files) |
| API | Vercel | Gemini AI + literature database search |

---

## Part 1 — Push to GitHub

### First-time setup (run once on your machine)

```bash
cd "/Users/subasah/review paper writer"

# Log in to GitHub (opens browser)
gh auth login

# Create repo and push (replace with your preferred repo name)
gh repo create review-paper-writer --public --source=. --remote=origin --push
```

If you already have an empty repo on GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Enable GitHub Pages

1. Open your repo on GitHub → **Settings** → **Pages**
2. Under **Build and deployment** → **Source**, select **GitHub Actions**
3. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables**
4. Add variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://YOUR-VERCEL-APP.vercel.app` (set this after Vercel deploy in Part 2)

5. Push to `main` — the workflow in `.github/workflows/deploy.yml` deploys automatically

Your site will be at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

---

## Part 2 — Deploy API to Vercel

Vercel hosts the `/api/*` serverless functions. The Gemini API key lives **only on Vercel**, never in the GitHub repo.

### Option A — Vercel website (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project**
3. Import the same GitHub repo (`review-paper-writer`)
4. Vercel auto-detects the `api/` folder — no framework preset needed for API routes
5. Click **Deploy**
6. Copy your deployment URL (e.g. `https://review-paper-writer-abc123.vercel.app`)

### Option B — Vercel CLI

```bash
npm i -g vercel
cd "/Users/subasah/review paper writer"
vercel login
vercel          # first deploy (follow prompts, link to GitHub repo)
vercel --prod   # production deploy
```

---

## Part 3 — Configure Gemini API Key on Vercel

### Get a Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **Create API key**
3. Copy the key (starts with `AIza...`)

### Add it to Vercel

1. Open [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:

| Name | Value | Environments |
|------|-------|--------------|
| `GEMINI_API_KEY` | `AIza...your-key...` | Production, Preview, Development |

5. Click **Save**
6. **Redeploy** the project (Deployments → ⋮ on latest → Redeploy) so the new key is picked up

### Optional environment variables

| Name | Required | Description |
|------|----------|-------------|
| `GEMINI_API_KEY` | **Yes** | Google AI Studio API key |
| `SCOPUS_API_KEY` | No | Elsevier Scopus API |
| `WOS_API_KEY` | No | Web of Science API |
| `ALLOWED_ORIGINS` | No | CORS, e.g. `https://yourusername.github.io` |

---

## Part 4 — Connect frontend to API

After both are deployed:

1. **GitHub:** Set `VITE_API_URL` variable to your Vercel URL (Part 1, step 4)
2. **Re-run** the GitHub Actions workflow (Actions tab → Deploy to GitHub Pages → Run workflow)
3. Open your GitHub Pages site → **Settings** in the app → confirm API URL is correct

Or users can set the API URL manually in the app **Settings** page (stored in browser localStorage).

---

## Verify everything works

```bash
# Test API health (should return error about POST if GET, but proves route exists)
curl -X POST https://YOUR-VERCEL-APP.vercel.app/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Say hello"}'
```

If you get a JSON response (not a network/CORS error), the API is live.

---

## Local development

```bash
cp .env.example .env.local
# Edit .env.local: VITE_API_URL=http://localhost:3000

# Terminal 1
npm run dev

# Terminal 2 — needs GEMINI_API_KEY in .env or shell
export GEMINI_API_KEY=AIza...
npx vercel dev
```

For local API, create `.env` in project root (gitignored):

```
GEMINI_API_KEY=AIza...
```

Vercel CLI reads this automatically when running `vercel dev`.
