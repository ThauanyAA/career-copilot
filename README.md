# Career Copilot

> AI-powered job application assistant focused on reducing repetitive application work with candidate memory, reusable answers, and structured AI workflows.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-green)
![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-purple)
![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM-orange)

---

## Overview

Career Copilot is an AI-powered assistant for job applications. It started as a Job Match Analyzer and is evolving into a protected workspace where candidates can keep profile memory, save reusable answers, analyze role fit, and generate application preparation materials from structured AI workflows.

The product goal is to help candidates reduce application friction by:

- analyzing resume and job description alignment;
- storing candidate profile context;
- reusing answers for repetitive application questions;
- generating tailored application prep from profile, reusable answers, resume, and job description;
- eventually supporting application history, resume context optimization, and assisted workflows.

This project is also part of a practical postgraduate learning journey in AI engineering, structured outputs, LangGraph workflows, Supabase, and product-oriented software architecture.

---

## Current Project Phase

Active development: authenticated MVP foundation plus Application Prep v1.

### Implemented

- Public Job Match Analyzer on `/`.
- Supabase Auth with SSR session handling.
- Protected app shell under `(app)` routes.
- Candidate profile persistence with Row Level Security.
- Reusable application answers with categories and CRUD.
- Authenticated dashboard/navigation/logout flow.
- Protected New Application workflow on `/applications/new`.
- Shared New Application inputs with two paths:
  - analyze fit first;
  - prepare application now.
- Existing match analysis API at `POST /api/analyze`.
- Application Prep API at `POST /api/applications/prep`.
- Deterministic LangGraph Application Prep workflow.
- Application Prep uses authenticated profile, reusable answers, pasted resume, and pasted job description.
- Application Prep uses one structured LLM generation call.
- Zod validation for API inputs, AI outputs, and graph state.
- OpenRouter integration through a shared structured-output service.
- Cost-aware deterministic model routing in `src/ai/modelRouting.ts`.

### Not implemented yet

- Persisted application prep/history.
- Application tracking dashboard.
- Resume storage/versioning.
- Resume/job-description summarization or cache.
- Streaming responses.
- Browser automation/autofill.
- PDF resume parsing.
- Job URL scraping.
- Billing, quotas, or paid plan enforcement.

---

## Core User Flows Today

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
  -> opens /applications/new
  -> pastes resume + job description once
  -> chooses Analyze Fit First or Prepare Application Now
```

### Application Prep

```text
POST /api/applications/prep
  -> authenticates with Supabase
  -> loads candidate profile
  -> loads reusable answers
  -> invokes deterministic LangGraph workflow
  -> validates structured Application Prep result
  -> returns application-ready sections to the UI
```

---

## Main Features

### 1. Job Match Analyzer

Compares pasted resume content against a pasted job description and returns:

- match score;
- strengths;
- missing skills/capability gaps;
- quick summary;
- improvement actions.

Available both on the public home page and inside the authenticated New Application workflow.

### 2. Candidate Profile Memory

Authenticated users can maintain profile context including:

- name;
- headline;
- location;
- LinkedIn, GitHub, and portfolio links;
- target roles;
- skills;
- salary expectation;
- notice period;
- work authorization;
- English level;
- relocation preference.

This context is loaded by Application Prep so the user does not need to repeat stable candidate facts every time.

### 3. Reusable Answers

Users can save common application answers by category:

- salary expectation;
- notice period;
- work authorization;
- relocation;
- availability;
- motivation;
- experience summary;
- custom.

Application Prep deterministically selects relevant saved answers based on the pasted resume and job description before making the LLM call.

### 4. Application Prep

Application Prep generates practical materials for a specific application:

- fit summary;
- tailored pitch;
- suggested application answers;
- missing candidate information;
- application risks;
- prep checklist.

The v1 workflow is intentionally deterministic and cost controlled:

- validate request;
- load candidate context;
- select reusable answers without an LLM;
- estimate complexity;
- resolve model route;
- make one structured LLM generation call;
- validate the result.

No persistence, streaming, or browser automation is part of v1 yet.

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
- Deterministic model routing

### Tooling

- Node.js 24
- npm
- ESLint
- TypeScript

---

## Architecture

### High-level application flow

```text
Next.js App Router
  -> Server Components / Client Components
  -> Server Actions / Route Handlers
  -> Supabase SSR client / AI services
  -> Postgres with RLS / OpenRouter structured output
  -> Zod validation
  -> UI rendering
```

### Job analysis flow

```text
JobMatchAnalyzer or ApplicationPrep UI
  -> POST /api/analyze
  -> JobAnalysisService
  -> OpenRouterService
  -> LLM structured response
  -> Zod validation
  -> AnalysisResults
```

### Application Prep flow

```text
ApplicationPrep UI
  -> POST /api/applications/prep
  -> Supabase auth check
  -> candidate_profiles + reusable_answers queries
  -> LangGraph Application Prep workflow
  -> deterministic context/reusable-answer selection
  -> model route resolution
  -> one OpenRouter structured generation call
  -> Zod validation
  -> Application Prep result sections
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
│   │   └── applications/
│   │       └── prep/
│   ├── auth/
│   │   └── callback/
│   ├── layout.tsx
│   └── page.tsx
│
├── src/
│   ├── ai/
│   │   ├── applicationPrep/
│   │   │   ├── nodes/
│   │   │   ├── graph.ts
│   │   │   ├── context.ts
│   │   │   ├── prompts.ts
│   │   │   └── reusableAnswerSelector.ts
│   │   ├── prompts/
│   │   ├── services/
│   │   └── modelRouting.ts
│   ├── components/
│   │   ├── ApplicationPrep.tsx
│   │   ├── JobMatchAnalyzer.tsx
│   │   └── AnalysisResults.tsx
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

Required values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_DEFAULT_MODEL=qwen/qwen3-235b-a22b-2507
OPENROUTER_FREE_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
OPENROUTER_CHEAP_MODEL=qwen/qwen3-235b-a22b-2507
OPENROUTER_STRONG_MODEL=qwen/qwen3-235b-a22b-2507
```

Optional LangSmith tracing values are listed in `.env.example`.

Do not commit `.env` or `.env.local`.

### 5. Configure Supabase Auth

Create a Supabase project and copy:

- Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
- Publishable/Anon key -> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

In Supabase Auth settings, add the local redirect URL:

```text
http://localhost:3000/auth/callback
```

For production/deployment, also add your deployed callback URL:

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

Current required tables:

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
/applications/new      New Application workflow
```

### API

```text
POST /api/analyze              Job match analysis
POST /api/applications/prep    Application Prep
```

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npx tsc --noEmit # Run TypeScript check
```

---

## Supabase Data Model

### `candidate_profiles`

One profile per authenticated user.

Protected by RLS using:

```sql
user_id = auth.uid()
```

Stores stable candidate context used by Application Prep.

### `reusable_answers`

User-owned library of common application answers.

Categories:

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

The project is designed to avoid unexpected AI costs.

Current cost-control foundations:

- deterministic model routing;
- user-tier-aware model cost classes;
- no paid fallback for free-tier Application Prep routes;
- compact candidate context assembly;
- capped reusable answer selection;
- bounded structured outputs;
- no agent loops for Application Prep v1;
- exactly one LLM generation node in Application Prep.

Performance and cost work still to explore:

- summarize or compact large resumes;
- cache stable resume summaries;
- summarize long job descriptions;
- decide whether resume storage is worth the product and privacy tradeoff;
- tune behavior by free vs paid tier.

---

## Roadmap

### Current focus

- Improve Application Prep UX based on real usage.
- Measure latency and token usage on large resume/job-description inputs.
- Design context summarization/compaction strategy.
- Decide how resume storage/versioning should work.

### Next milestones

- Save generated application prep/history.
- Add application dashboard/history.
- Improve profile and reusable answers UX.
- Add profile gap detection.
- Add usage limits and tier behavior.

### Later exploration

- Job URL extraction.
- Browser-assisted autofill.
- Playwright/MCP automation.
- Application tracking dashboard.
- Billing and paid plans.
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

Active development.

```text
Done:
- Job Match Analyzer
- OpenRouter integration
- Structured AI responses
- Supabase auth foundation
- Protected app workspace
- Candidate profile memory
- Reusable answers library
- Deterministic model routing
- LangGraph Application Prep workflow
- Application Prep API
- New Application UI with shared inputs and two paths

Next:
- Performance and cost review for large inputs
- Context compaction strategy
- Persistence/history
- Resume storage decision
```

---

## License

This project is currently under active development as an educational, portfolio, and product exploration initiative.
