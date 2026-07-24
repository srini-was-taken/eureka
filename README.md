# EurekaAI 🧠

> The AI tutor that refuses to hand you the answer — until you've earned it.

Built for JEE Advanced. Every feature is designed around how you actually learn, not just how you consume content.

## Features

- **Socratic Solver** — Guided problem-solving via Socratic questioning. Never gives you the answer directly.
- **Feynman Explainer** — Explain a concept in your own words. AI evaluates your understanding and finds the gaps.
- **Focus Mode** — Distraction-free PDF reader with built-in Pomodoro timer.
- **Mistake Journal** — Auto-logs struggles with AI diagnosis and spaced repetition.
- **Problem Bank** — Personal tagged problem collection with status tracking.
- **Dashboard** — Weak area tracker, Problem of the Day, study stats.

## Stack

- **Frontend**: Next.js 14 (App Router) + inline styles
- **Backend**: Next.js API Routes (coming soon)
- **Database**: Supabase (coming soon)
- **AI**: Claude API via Anthropic SDK (coming soon)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Fill in your Anthropic API key and Supabase credentials

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
eureka-ai/
├── app/
│   ├── layout.jsx          # Root layout + font
│   ├── globals.css         # Global styles
│   ├── page.jsx            # Landing page
│   ├── login/page.jsx      # Login / Signup
│   ├── dashboard/page.jsx  # Main dashboard
│   ├── solver/page.jsx     # Socratic Solver
│   ├── feynman/page.jsx    # Feynman Explainer
│   ├── focus/page.jsx      # Focus Mode + Pomodoro
│   ├── mistakes/page.jsx   # Mistake Journal
│   └── problems/page.jsx   # Problem Bank
├── components/
│   ├── ui/
│   │   ├── Badge.jsx
│   │   ├── Btn.jsx
│   │   ├── Card.jsx
│   │   └── Icon.jsx
│   └── layout/
│       └── Sidebar.jsx
├── lib/
│   └── theme.js            # Color constants
└── .env.local.example
```

## Next Steps (post-hackathon)

- [ ] Wire up `/api/solver` with Claude API + streaming
- [ ] Wire up `/api/feynman/evaluate` with structured JSON response
- [ ] PDF upload to Supabase Storage + text extraction
- [ ] Supabase Auth (login/signup)
- [ ] User progress tracking + confidence scores
- [ ] Real problem bank with JEE past papers

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

One click. Works out of the box on Vercel.
