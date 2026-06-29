# EurekaAI - Project Context

Welcome to the EurekaAI codebase! This document provides a high-level overview of the project to help new developers (like you!) get up to speed quickly.

## 🎯 What is EurekaAI?
EurekaAI is an anti-cheat, active-learning AI tutor designed to help students build genuine understanding rather than just giving them answers. Based on proven educational psychology frameworks like the **Socratic method**, the **Feynman technique**, and **Bloom's 2 Sigma Problem**, EurekaAI forces students to think critically and learn through active recall.

Originally inspired by the rigor of Indian competitive exams like JEE Advanced, the platform has been generalized to help students globally master complex subjects like University STEM and APs.

## ✨ Core Features
- **Socratic Solver**: Instead of blurting out the answer, the AI acts as a world-class tutor. It asks guided questions to help students reach the solution themselves.
- **Focus Mode**: A timed, distraction-free environment (e.g., 25-minute Pomodoro sessions) to help students study notes or textbooks deeply.
- **Feynman Explainer**: Students explain concepts in their own words (voice or text), and the AI pinpoints the exact gaps in their reasoning.
- **Mistake Journal**: A system to track, log, and resurface past errors so students never make the same mistake twice.
- **Dashboard**: The central hub for students to track their progress and launch into different study tools.

## 🛠️ Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (using the App Router)
- **Frontend**: React 18
- **Styling**: Vanilla CSS with CSS Custom Properties (Variables) for theming. We rely heavily on custom CSS in `src/app/globals.css` (glassmorphism, smooth animations, grid layouts) rather than extensive Tailwind classes. 
- **Authentication & Database**: [Supabase](https://supabase.com/) (using `@supabase/ssr` for server-side auth).
- **AI/LLM**: Google Gemini API (powers the core tutoring logic, Socratic questioning, and gap analysis).
- **Markdown & Math**: `react-markdown`, `rehype-katex`, and `remark-math` for rendering complex mathematical equations perfectly.

## 📁 Project Structure

```text
eureka-ai/
├── package.json
├── context.md                 <-- You are here
└── src/
    ├── app/                   <-- Next.js App Router pages
    │   ├── page.jsx           <-- Landing page (Hero, Bento cards, FAQ)
    │   ├── globals.css        <-- Core CSS, themes, and animations
    │   ├── layout.jsx         <-- Root layout and metadata
    │   ├── login/             <-- Supabase Auth flow
    │   ├── dashboard/         <-- Student home screen
    │   ├── solver/            <-- Socratic Solver interface
    │   ├── focus/             <-- Focus Mode timer and tools
    │   ├── mistakes/          <-- Mistake Journal
    │   └── problems/          <-- Saved problems bank
    │
    ├── components/            <-- Reusable UI components
    │   └── ui/                <-- Base UI (Btn, Icon, etc.)
    │
    └── lib/                   <-- Utilities and configurations
        ├── supabase/          <-- Supabase client setups (client/server/middleware)
        └── theme.js           <-- Centralized color palette and theme constants
```

## 🎨 Design Philosophy & Theming
The UI is designed to look premium, dynamic, and engaging. We heavily utilize:
- **Bento Grids**: Used extensively on the landing page for feature showcases.
- **Micro-animations**: Subtle hover effects (e.g., cards scaling up and dropping deeper shadows, icons rotating) to make the app feel alive.
- **Theming**: We use a `theme.js` file alongside `globals.css` variables to define specific color themes for different parts of the app (e.g., distinct background colors for the Dashboard vs. Focus Mode). The primary brand color is a sophisticated Teal (`#0D9488`).
- **Icons**: We use the `lucide-react` library, typically wrapped in a custom `<Icon />` component. We've globally replaced generic "star" icons with a "brain" icon to fit the AI learning theme.

## 🚀 Getting Started Locally
1. Ensure your `.env.local` is set up with your Supabase keys and Gemini API key.
2. Run `npm install` to grab dependencies.
3. Run `npm run dev` to start the local Next.js development server.
4. Open `http://localhost:3000` to see the app!
