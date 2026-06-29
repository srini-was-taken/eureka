# EurekaAI

An AI-powered study companion built for JEE aspirants. EurekaAI combines a Socratic solver, Feynman technique evaluator, focus mode, mistake journal, and a problem bank; all in one clean interface.

---

## Features

- **Solver** : Paste a problem and get Socratic hints (not answers). Supports image uploads for handwritten/printed questions.
- **Feynman Mode** : Explain a concept in your own words and get AI feedback on gaps in your understanding.
- **Focus Mode** : Upload a PDF, study distraction-free with highlights, notes, and a Pomodoro timer.
- **Mistake Journal** : Log wrong answers and revisit them later with AI diagnosis of what went wrong.
- **Problem Bank** : Save problems for future practice.
- **Dashboard** : Overview of all your activity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth & Database | Supabase |
| AI | Groq API |
| Math Rendering | KaTeX |
| PDF Rendering | PDF.js |

### AI Models Used

| Use Case | Model |
|---|---|
| Text-based Socratic hints & Feynman evaluation | `llama-3.3-70b-versatile` |
| Image/vision inputs (photo of problem) | `meta-llama/llama-4-scout-17b-16e-instruct` |

Both models are served via **[Groq](https://groq.com)**; free tier available.

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/eureka-ai.git
cd eureka-ai
npm install
```

### 2. Get your API keys

You'll need keys from two services:

#### Groq (for AI)
1. Go to [console.groq.com](https://console.groq.com) and sign up for free.
2. In the dashboard, navigate to **API Keys** → **Create API Key**.
3. Copy the key; this is your `GROQ_API_KEY`.

#### Supabase (for database & auth)
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Create a **New Project**.
3. Once set up, go to **Project Settings → API**.
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (under "Service role") → `SUPABASE_SERVICE_ROLE_KEY`


### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

