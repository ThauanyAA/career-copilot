# Career Copilot 🚀

> An AI-powered career assistant designed to help candidates analyze job opportunities, identify skill gaps, and optimize their application strategy with intelligent workflows.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![LangChain](https://img.shields.io/badge/LangChain-AI-green)
![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-purple)
![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM-orange)

---

## Overview

Applying for jobs is often repetitive, time-consuming, and mentally exhausting.

Candidates frequently need to:

- manually compare resumes against job descriptions
- identify missing skills
- rewrite application answers
- optimize resumes for ATS systems
- repeat the same effort across multiple applications

**Career Copilot** was created to reduce this friction using AI-powered workflows and intelligent automation.

The goal is to evolve into a complete AI career assistant capable of helping candidates throughout the entire job application journey.

---

## Problem Statement

Modern job applications involve significant friction:

- repetitive form filling
- unclear alignment between profile and job requirements
- poor feedback on resume weaknesses
- generic application responses
- uncertainty about ATS compatibility
- difficulty prioritizing the right opportunities

This project aims to transform that experience into a guided, intelligent workflow.

---

## Current MVP Feature

### AI Job Match Analyzer

The first implemented feature analyzes a candidate profile against a job description and provides actionable insights.

### Current Flow

1. User pastes resume content
2. User pastes job description
3. AI analyzes profile alignment
4. Structured response is generated
5. Results are displayed in the UI

### Current Output

The system currently provides:

- Match score (%)
- Candidate strengths
- Missing skills / capability gaps
- Tailored improvement suggestions
- Application guidance

---

## Screenshots

> Screenshots will be added as the UI evolves.

---

## Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### AI / Orchestration

- LangChain
- LangGraph
- OpenRouter
- Prompt Engineering
- Structured Output Validation (Zod)

### Development Tooling

- ESLint
- Context7 (up-to-date documentation assistance)
- AI coding agents for implementation and architecture support

---

## Architecture

This project follows a modular architecture designed for AI-native applications.

### High-Level Flow

```text
Frontend UI
   ↓
Next.js API Routes
   ↓
AI Orchestration Layer
   ↓
LLM Services
   ↓
Structured Response Validation
   ↓
UI Rendering
```

---

## Project Structure

```text
career-copilot/
├── app/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
│
├── src/
│   ├── ai/
│   │   ├── graph/
│   │   │   ├── nodes/
│   │   │   └── graph.ts
│   │   │
│   │   ├── prompts/
│   │   │   └── v1/
│   │   │
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── tools/
│   │   └── state/
│   │
│   ├── components/
│   ├── lib/
│   └── types/
│
└── public/
```

---

## AI Architecture Philosophy

Career Copilot is being designed using AI-native software architecture principles.

Core concepts:

- workflow orchestration with LangGraph
- explicit graph state
- structured prompt engineering
- modular tool-based execution
- clear separation between UI, orchestration, and integrations
- deterministic schema validation

This avoids tightly coupling business logic directly to UI components or route handlers.

---

## Engineering Principles

This project follows:

- Clean architecture principles
- Separation of concerns
- Type safety first
- Modular AI orchestration
- Prompt versioning
- Minimal and maintainable abstractions
- Explicit contracts between layers

Code quality goals:

- strict TypeScript
- no `any`
- predictable structured outputs
- scalable folder organization
- framework best practices

---

## AI Development Workflow

AI coding agents are used as engineering accelerators while maintaining architectural control.

Current agent roles:

### Software Engineer Agent

Responsible for:

- feature implementation
- integration work
- safe refactoring
- maintainable code generation

---

### AI Architect Agent

Responsible for:

- workflow design
- LangGraph orchestration
- prompt architecture
- tool boundaries
- structured output design

---

### Code Reviewer Agent

Responsible for:

- architectural consistency
- maintainability review
- security concerns
- TypeScript quality
- AI implementation risks

---

## Setup

### Prerequisites

- Node.js 24
- npm / pnpm / yarn
- OpenRouter API key

---

## Installation

Clone the repository:

```bash
git clone https://github.com/thauanyaa/career-copilot.git
```

Enter the project:

```bash
cd career-copilot
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create:

```bash
.env.local
```

Example:

```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

---

## Running Locally

Start development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## Scripts

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Production start:

```bash
npm run start
```

---

## Roadmap

### Near-Term Improvements

- prompt refinement
- improved scoring consistency
- hallucination mitigation
- better loading/error UX
- response formatting improvements
- architecture hardening

---

### Planned Features

#### Career Intelligence

- resume ATS analysis
- resume optimization suggestions
- personalized skill roadmap
- role prioritization

---

#### Application Assistance

- tailored application answers
- cover letter generation
- recruiter-style feedback
- interview preparation

---

#### Automation

- browser-assisted autofill
- job application workflow automation
- job tracking dashboard
- application history

---

#### Advanced AI Features

- LinkedIn profile analysis
- GitHub profile analysis
- portfolio evaluation
- persistent candidate context
- multi-step AI workflows
- agentic decision-making

---

## Why This Project Matters

This project is not just a UI experiment.

It explores practical applications of:

- applied AI engineering
- workflow orchestration
- AI-native architecture
- prompt engineering
- structured LLM integrations
- scalable frontend/backend design

It represents the intersection between software engineering and intelligent automation.

---

## Academic Context

This project is being developed as part of ongoing practical exploration in:

- Applied AI Engineering
- LLM integrations
- MCP concepts
- LangChain / LangGraph workflows
- AI-assisted software engineering

The goal is to translate theoretical learning into a real-world product-oriented implementation.

---

## Author

**Thauany Alves**

Frontend Engineer | Applied AI Engineering Enthusiast

---

## Status

🚧 Active Development

Current milestone:

✅ MVP UI  
✅ OpenRouter integration  
✅ Structured AI responses  
✅ Initial AI architecture  
🚧 Workflow refinement in progress  

---

## License

This project is currently under active development as an educational, portfolio, and product exploration initiative.