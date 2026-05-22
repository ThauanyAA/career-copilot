# Career Copilot 🚀

> AI-powered job application assistant focused on reducing repetitive application work with candidate memory, reusable answers, and structured AI workflows.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-green)
![LangChain](https://img.shields.io/badge/LangChain-AI-green)
![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-purple)
![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM-orange)

---

## Overview

Career Copilot started as an AI Job Match Analyzer and is evolving into a persistent job application assistant.

The product goal is to help candidates reduce job application friction by:

- analyzing resume/job alignment;
- storing candidate profile memory;
- saving reusable answers for repetitive application questions;
- preparing candidates for applications with AI-generated guidance;
- eventually assisting with application workflows and automation.

This project is also part of my postgraduate learning journey, applying concepts from AI engineering, LangChain/LangGraph, structured outputs, Supabase, and product-oriented software architecture.

---

## Current Project Phase

🚧 **Active development — MVP foundation + AI Application Prep groundwork**

### Implemented

- Public AI Job Match Analyzer on `/`.
- Protected authenticated workspace under `(app)` routes.
- Supabase authentication with SSR session handling.
- Protected routes and logout flow.
- Candidate profile persistence with Row Level Security.
- Reusable application answers with categories and CRUD.
- Authenticated navigation/dashboard.
- Protected analyzer workspace on `/applications/new`.
- Structured AI output validation with Zod.
- OpenRouter integration for the existing job analysis flow.
- Cost-aware deterministic model routing layer.
- Application Prep contracts and deterministic helper functions.

### In progress / not wired yet

- LangGraph-based Application Prep workflow.
- Application Prep API endpoint and UI result rendering.
- Persisting generated application prep/history.
- Resume storage/versioning.

### Not implemented yet

- Browser automation / autofill agent.
- Billing / paid plans.
- Streaming responses.
- PDF resume parsing.
- Job URL scraping.

---

## Core User Flow Today

### Public analyzer

```text
User opens /
  -> pastes resume content
  -> pastes job description
  -> receives structured job match analysis
```

### Authenticated workspace

```text
User signs up/logs in
  -> accesses dashboard
  -> completes candidate profile
  -> saves reusable application answers
  -> opens New Application / Analyzer
  -> runs the current job match analyzer inside the protected app
```

---

## Main Features

### 1. AI Job Match Analyzer

The initial AI feature compares pasted resume content against a pasted job description and returns:

- match score;
- strengths;
- missing skills/capability gaps;
- quick summary;
- improvement actions.

This flow is currently synchronous and uses OpenRouter through the existing AI service layer.

### 2. Candidate Profile Memory

Authenticated users can maintain a persistent candidate profile containing information such as:

- name;
- headline;
- location;
- links;
- target roles;
- skills;
- salary expectation;
- notice period;
- work authorization;
- English level;
- relocation preference.

The goal is to make future AI workflows reuse known candidate context instead of asking the user to repeat the same information.

### 3. Reusable Answers

Users can save common application answers by category, such as:

- salary expectation;
- notice period;
- work authorization;
- relocation;
- availability;
- motivation;
- experience summary;
- custom answers.

These answers will later be reused by AI Application Prep to generate better, more consistent application responses.

### 4. AI Application Prep Groundwork

The next AI phase is being prepared with:

- compact Zod contracts;
- deterministic model routing;
- candidate context assembly;
- reusable answer selection;
- complexity estimation.

The intended v1 workflow is a deterministic LangGraph flow with only one LLM generation node to control cost and complexity.

---

## Tech Stack

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS

### Backend / Persistence

- Next.js Route Handlers
- Server Actions
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security

### AI

- OpenRouter
- LangChain
- LangGraph
- Zod structured output validation
- Deterministic model routing for cost control

### Tooling

- Node.js 24
- npm
- ESLint
- TypeScript

---

## Architecture

### Current high-level flow

```text
UI / App Router
  -> Server Components / Client Components
  -> Server Actions / API Routes
  -> Supabase SSR client / OpenRouter services
  -> Postgres with RLS / LLM structured output
  -> Zod validation
  -> UI rendering
```

### Existing AI analysis flow

```text
JobMatchAnalyzer
  -> POST /api/analyze
  -> JobAnalysisService
  -> OpenRouterService
  -> LLM structured response
  -> Zod validation
  -> UI results
```

### Planned Application Prep flow

```text
/applications/new
  -> pasted resume + job description
  -> load authenticated candidate context
  -> select reusable answers deterministically
  -> estimate complexity
  -> resolve model route
  -> LangGraph Application Prep workflow
  -> one structured LLM generation call
  -> validated Application Prep result
```

---

## Project Structure Snapshot

```text
career-copilot/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── answers/
│   │   └── applications/
│   │       └── new/
│   ├── api/
│   │   ├── analyze/
│   │   └── applications/        # planned Application Prep endpoint area
│   ├── auth/
│   │   └── callback/
│   └── page.tsx
│
├── src/
│   ├── ai/
│   │   ├── applicationPrep/
│   │   ├── graph/
│   │   ├── prompts/
│   │   ├── services/
│   │   └── modelRouting.ts
│   ├── components/
│   ├── lib/
│   │   └── supabase/
│   └── types/
│       ├── analysis.ts
│       ├── applicationPrep.ts
│       └── database.ts
│
├── supabase/
│   └── migrations/
├── proxy.ts
├── package.json
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js 24.x
- npm
- Supabase project
- OpenRouter API key

This repository enforces Node 24 through:

- `.nvmrc`
- `package.json` engines
- `.npmrc` with `engine-strict=true`

### 1. Clone the repository

```bash
git clone https://github.com/ThauanyAA/career-copilot.git
cd career-copilot
```

### 2. Use the correct Node version

```bash
nvm use
node -v
```

Expected:

```text
v24.x.x
```

If `nvm` is not loaded in your terminal:

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env.local
```

If `.env.example` is not available in your local checkout, create `.env.local` manually:

```env
OPENROUTER_API_KEY=your_openrouter_api_key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Optional model routing overrides
OPENROUTER_DEFAULT_MODEL=qwen/qwen3-235b-a22b-2507
OPENROUTER_FREE_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
OPENROUTER_CHEAP_MODEL=qwen/qwen3-235b-a22b-2507
OPENROUTER_STRONG_MODEL=qwen/qwen3-235b-a22b-2507
```

Do **not** commit `.env.local`.

### 5. Configure Supabase

Create a Supabase project and copy:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Publishable/Anon key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

In Supabase Auth settings, add the local redirect URL:

```text
http://localhost:3000/auth/callback
```

For production/deployment, also add your deployed domain callback URL:

```text
https://your-domain.com/auth/callback
```

### 6. Apply database migrations

The project includes SQL migrations under:

```text
supabase/migrations/
```

Apply them using your preferred Supabase workflow.

With Supabase CLI configured:

```bash
supabase db push
```

Or paste/run the migration SQL files in the Supabase SQL Editor in timestamp order.

Required current tables:

- `candidate_profiles`
- `reusable_answers`

### 7. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Useful Routes

### Public

```text
/                  Public Job Match Analyzer
/login             Login
/signup            Sign up
/auth/callback     Supabase auth callback
```

### Protected

```text
/dashboard             Authenticated dashboard
/profile               Candidate profile memory
/answers               Reusable application answers
/applications/new      Protected analyzer workspace
```

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

Known note: some repo-wide checks may still surface older out-of-scope issues while the MVP is evolving. Focused lint has been used during incremental feature work.

---

## Supabase Data Model

### `candidate_profiles`

One profile per authenticated user.

Protected by RLS using:

```sql
user_id = auth.uid()
```

### `reusable_answers`

User-owned library of common application answers.

Categories include:

```text
salary_expectation
notice_period
work_authorization
relocation
availability
motivation
experience_summary
custom
```

---

## Cost Control Strategy

The project is being designed to avoid unexpected AI costs.

Current cost-control foundations:

- deterministic model routing;
- user-tier-aware model cost classes;
- no paid fallback for free-tier routes;
- compact context assembly before LLM calls;
- capped reusable answer selection;
- bounded structured outputs;
- no agent loops for Application Prep v1.

Planned Application Prep v1 should use a deterministic LangGraph workflow with exactly one LLM generation node.

---

## Roadmap

### Current milestone

- Finish deterministic Application Prep helpers.
- Build LangGraph Application Prep skeleton.
- Add one-call structured Application Prep generation.
- Add protected `/api/applications/prep` endpoint.
- Add Application Prep UI to `/applications/new`.

### Next milestones

- Save generated application prep/history.
- Add application dashboard/history.
- Add resume storage/versioning.
- Improve profile and answers UX.
- Add AI-generated tailored answers.
- Add profile gap detection.

### Later exploration

- Job URL extraction.
- Browser-assisted autofill.
- Playwright/MCP automation.
- Application tracking dashboard.
- Billing and usage limits.
- More advanced LangGraph orchestration.

---

## Academic Context

This project is being developed as part of practical postgraduate exploration in:

- Applied AI Engineering;
- LLM integrations;
- structured outputs;
- AI-assisted development;
- MCP concepts;
- LangChain and LangGraph workflows;
- product-oriented automation.

The project intentionally balances learning goals with pragmatic MVP decisions.

---

## Author

**Thauany Alves**

Frontend Engineer | Applied AI Engineering Enthusiast

---

## Status

🚧 Active Development

Current status summary:

```text
✅ Job Match Analyzer
✅ OpenRouter integration
✅ Structured AI responses
✅ Supabase auth foundation
✅ Protected app workspace
✅ Candidate profile memory
✅ Reusable answers library
✅ Deterministic model routing
✅ Application Prep contracts
✅ Deterministic Application Prep helpers
🚧 LangGraph Application Prep workflow in progress
```

---

## License

This project is currently under active development as an educational, portfolio, and product exploration initiative.
