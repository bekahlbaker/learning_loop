# Learning Loop

> A personal side project for learning modern web tooling and getting hands-on with building software *around* an LLM — not just calling one.

## What this is

**Learning Loop** is the learner-facing half of an experimental **Adaptive Learning Coach** — a validation-first proof of concept that adapts lesson delivery, tone, and pacing to each learner's behavior in real time.

The system is split into two services with a deliberately strict separation of concerns:

- **The Loop** (this repo) — handles phone-number onboarding, flash-card lesson delivery, behavioral event emission, and rendering whatever the Brain tells it to. It teaches, but it never *decides*.
- **The Brain** (a separate service) — consumes the stream of `LearningEvent`s the Loop emits and returns `BrainDirective`s: routing decisions, teaching tone, and mastery scores. It decides, but it never speaks to the learner.

An LLM sits inside the Loop purely as an invisible teaching layer — it controls the tone and phrasing of lesson feedback, never routing or grading. Learners are never told AI is involved.

The sample course is **Food Safety Essentials for Restaurant Staff** (3 levels, 12 lessons + 3 level reviews, aligned to the US FDA Food Code 2022), delivered through two demo personas — an experienced learner and a brand-new one — who get visibly different journeys through identical content.

## Why I built it

This is a **side project, built mostly to learn the Brain and LLM side of the system**. The goals, in priority order:

1. **Understand how to work *with* AI as a building block**, not just consume it. That means thinking about the boundary between deterministic application logic and probabilistic model output — where the model is allowed to influence the experience, and where it explicitly is not.
2. **Build out the Brain — the decision and adaptation layer.** This is the genuinely unfamiliar part and where most of the effort goes: turning a stream of behavioral events into directives, and proving those directives actually improve outcomes.
3. **Practice a validation-first discipline.** The architecture forces a clean contract (events in, directives out) and treats every adaptive decision as something to be measured and proven before it's trusted, rather than assumed to work.

The frontend is deliberately *not* where the learning happens. I'm very experienced with React, Next.js, Tailwind, and TypeScript, so I chose them precisely to keep frontend friction near zero — a familiar, fast stack that gets the learner-facing surface out of the way so I can focus on the Brain and LLM work.

It is **not** production software and isn't trying to be. The point is the experiment and the architecture.

## Tech stack & why

| Choice | What it's for | Why |
| --- | --- | --- |
| **Next.js 16** (App Router) | Full-stack React framework | A stack I already know well, so there's no learning curve to slow me down. Server Components keep the client bundle small, and API routes (`app/api/*`) give a clean place for the teacher and event endpoints without standing up a separate backend. |
| **React 19** | UI | Familiar by design — chosen to minimize frontend friction so the effort can go into the Brain and LLM layers, not the UI. |
| **TypeScript** | Everything | A tool I'm comfortable in, and the Loop↔Brain contract lives in shared types (`app/types/`). Strong typing across the boundary is what makes the two-service split safe to evolve. |
| **Tailwind CSS v4** | Styling | Lets me build the learner-facing surface fast without thinking about it — a known quantity that keeps frontend work low-cost. |
| **Vercel AI SDK** (`@ai-sdk/anthropic`) | LLM teacher integration | Gives a clean streaming abstraction over the model so the AI teacher feels responsive, and keeps provider details out of the UI. |
| **`@adaptive/shared`** (local workspace pkg) | Shared contract with the Brain | Event and directive types are shared as a linked package so the Loop and Brain can't silently drift apart. |

The deliberate constraint throughout: **the LLM is infrastructure.** It generates lesson feedback and nothing more. It never grades, never routes, and is never named or surfaced in the UI.

## Getting started

Requires Node 20 (see `.nvmrc`).

```bash
yarn install      # or npm install
yarn dev          # start the dev server
```

Open [http://localhost:3000](http://localhost:3000).

You'll need an Anthropic API key in `.env.local` for the AI teacher feedback to work. Without it, the teacher area degrades silently (by design) and the rest of the lesson flow still runs.

## Project structure

```
app/
  api/          API routes — teacher (LLM feedback) and events (behavioral emission)
  components/   Reusable UI, grouped by category
  constants/    curriculum.json, seeded personas
  hooks/        Reusable hooks
  lib/          Library-specific utilities
  messages/     All user-facing copy
  types/        The Loop↔Brain contract: events, directives, curriculum, onboarding
  onboarding/   Onboarding flow
  session/      Flash-card lesson session
```

## Status

Active learning project. The Loop UI and AI teacher integration are built; the Brain integration is staged to swap mocked directives for live ones. See [`CLAUDE.md`](CLAUDE.md) for the full wave-by-wave build plan and the architectural rules that hold the two halves apart.
