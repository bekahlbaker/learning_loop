# Adaptive Learning Coach Platform — Learning Loop (Teacher & Experience)

Companion document: Decision & Adaptation Layer ("The Brain") — Project Summary. This document and that one are designed to be read together and built in tandem.

## Scope of This Document

This summary covers the Learning Loop — the learner-facing adaptive teaching experience and the application that delivers it, with an LLM acting as the teacher.

All decision-making, scoring, profile computation, and behavior-driven adaptation — collectively "the brain" — are deliberately out of scope here and live in the companion Decision & Adaptation Layer document. The Learning Loop treats the brain as a separate component it integrates with through a clean contract:

- The loop emits behavioral events as the learner interacts.
- The brain returns directives, mastery scores, profile updates, and recommendations.
- The loop renders those results into teaching and UI.

The loop never decides or scores. The brain never speaks to the learner.

## Vision

Deliver a learning experience that feels like a personal teacher rather than a traditional LMS: responsive and tailored in tone and pacing to the individual.

Instead of pushing every learner through the same fixed Lesson → Quiz → Pass → Next path, the experience adapts to how the learner actually behaves in it. The Learning Loop is responsible for observing the learner, delivering instruction, and presenting the adapted experience. The decisions about how to adapt — based on observed behavior — are made by the separate adaptation component (the brain) documented in the companion summary.

The system does not simply present content — it adapts the experience to the individual. (How that adaptation is decided is the subject of the companion document.)

## Goals

### Immediate Goal

A validation-first proof of concept that, on the experience side, demonstrates:

- Phone login and settings-based onboarding
- Adaptive lesson delivery
- Personalized teaching styles and tone
- A learner-facing progression experience
- Visibly different journeys for different learners (driven by the brain, rendered by the loop)
- Profile and progress visualization, including evolution over time

### What "Production-Quality PoC" Means

When production quality conflicts with validation speed, validation wins. "Production-quality" means clean code and patterns at a small, well-structured scope that could be grown later — not production architecture, scale, or analytics.

### Long-Term Goal

The learning coach can grow into a real learning product, but it is also the controlled domain in which the team demonstrates a broader capability: building products whose experience adapts to how people actually behave in them. The lasting asset is the team's skill at building and proving these adaptive experiences — not a reusable model or platform. That framing is detailed in the companion document.

## The Experience Loop

Observe → [Build Profile] → Deliver → [Measure / Adjust] → Continue

The Learning Loop owns Observe (capturing events), Deliver (teaching), Continue, and all rendering. The bracketed steps — building the profile and measuring/adjusting — are performed by the brain; the loop simply hands over events and renders what comes back.

## Key Features

### Onboarding (Login & Settings)

Onboarding happens through a phone-number login flow rather than a conversation or a form: the learner enters their phone number, receives a code, and the code is validated. On successful login, the learner is asked for their name in a single text input. They are then presented with a settings dashboard that shows all onboarding questions (e.g., Are you new to this topic? How confident are you? What are your goals? Do you have a deadline? How much time can you spend daily?) as options they can update. Every option defaults to the middle of its range: a slider from 1–7 is preset to 4, a slider from 1–10 is preset to 5, and a four-button choice is preset to the second option. The loop captures the name and these settings and passes them to the brain, which builds the initial profile.

### Adaptive Lesson Delivery

Lessons are presented as flash cards, with one lesson card shown on the screen at a time. The lesson details (level, etc.) show at the top of the card, the image or text below, and then the question and possible answer options below. The loop renders the brain's chosen content, format, and explanation depth. Only structured question types are delivered (multiple choice, scenario-based, knowledge checks); free-form responses are excluded from the PoC.

### The Teacher (LLM Layer)

The LLM is the presentation layer — the part the learner reads. It generates the lesson content shown on the cards, explains concepts, phrases hints, and adapts tone (patient for a nervous beginner, terse and challenging for an expert). It owns how things are said, never what happens next. It does not score answers, decide routing, or update the profile.

In the loop, it is the brain's mouthpiece: it receives a structured directive ("explain this concept simply with a worked example, encouraging tone" or "be brief, pose a challenge") and renders it into teaching. Anything the interaction produces is captured as events and returned to the brain.

### Progress Visualization

Learners can see a roadmap, completed lessons, current mastery (value from the brain), recommended next steps (from the brain), and the content library.

### Profile Evolution Views (Display Only)

- Short-term — during the session: the audience watches the experience change live as the brain reacts (e.g., a recommendation shifts after a run of misses).
- Long-term — simulated history: an admin panel renders an accelerated arc (e.g., Day 1 → Day 30) built from stored events.

Both are visualizations; the underlying values and the simulated history are produced by the brain.

## Technical Architecture (Loop)

### Frontend

Stack: Next.js, React, TypeScript, TailwindCSS, React Query.

Core screens:

- Onboarding (Login & Settings)
- Learning Session (Flash Cards)
- Progress Dashboard
- Admin / Debug Dashboard (renders the brain's data, including the simulated-history view)

### Backend (Loop-Owned)

Stack: Node.js, Next.js API Routes, PostgreSQL, Prisma ORM (shared store).

Loop services:

- AI Teacher Service — prompts the foundation model, renders directives into teaching.
- Session orchestration — runs the live interaction.
- Event capture — emits Learning Events to the brain.
- Progress / Profile presentation — displays brain-supplied scores and profile state.

(Decision Engine, mastery scoring, and profile computation are brain services — see the companion document.)

### AI / Teacher Layer

Use a strong existing foundation model — quality over cost — reached by API and driven by prompts (not fine-tuning) for the PoC. Responses are streamed so the live demo stays responsive. The AI acts as teacher, coach, and presenter only; it makes no business decisions and does not grade.

### Contract With the Brain

The loop sends events and a "what's next?" request; the brain returns a directive plus updated scores/profile; the loop renders the result. The brain is the source of truth for state and routing.

## Data Model (Loop-Owned / Shared)

- Users — account information.
- Lessons — content, concepts, prerequisites, assessments (team-authored).
- Progress (presentation) — completion and status; the mastery score value comes from the brain.
- Learning Events — emitted by the loop as the learner acts (answered correctly/incorrectly, requested help, abandoned lesson, completed lesson, revisited, etc.). The brain consumes these; the event schema design lives in the companion document.

(The Learner Profile store and schema are owned by the brain.)

## Content Scope

5–10 lessons on a single simple topic, structured into concepts, prerequisites, and assessments. Structured question types only. Because explanation correctness rides on the LLM, content review of the small demo course remains important.

## Risks (Loop)

### AI Hallucinations / Explanation Correctness

The LLM teacher can produce incorrect or inconsistent explanations. Mitigation: structured outputs, content review of the demo course, and exclusion of free-form grading (a brain concern — see companion doc). Explanation correctness still depends on the model.

### Demo Latency

"Best available model" often means slower responses, which matters in a live demo. Mitigation: stream responses; treat perceived responsiveness as a UX requirement distinct from cost.

### Feature Creep

Mitigation: validation wins over production quality; scope is deliberately minimal.

(Data privacy and over-personalization are primarily brain-stage concerns and are covered in the companion document.)

## Recommended PoC Scope (Loop)

- Course: one simple, self-authored topic.
- Lessons: 5–10 maximum.
- Personas: three seeded learners (Experienced, New, Disengaged) — divergence driven by the brain.
- Audience: internal leadership.
- Core demonstration (loop-side): login and settings-based onboarding → render the brain's directive as teaching on flash cards → present questions (structured types) → emit events → display the brain's recommendation, updated mastery, and progress → show short-term (live) and long-term (simulated) profile evolution.

## Success Criteria (Loop)

Internal leadership can clearly see that:

- The experience feels like a responsive personal teacher, not a static LMS.
- The same content produces visibly different experiences for different learners (decisions from the brain, rendered live).
- Both the live session and the long-term view are legible and compelling.
- The clean, minimal architecture could grow into a real product and demonstrates a capability the team can apply to other products: experiences that adapt to real user behavior.

(Criteria about decision correctness, the adaptation logic, and how its lift is validated are in the companion document.)

## Implementation Plan (Loop — Built in Tandem With the Brain)

1. Author the curriculum/content for the chosen topic.
2. Build the onboarding UI — phone-number login, name input, and settings dashboard (captures inputs for the brain).
3. Build the learning-session UI — flash cards (structured question types).
4. Integrate the AI teacher layer (best available model; prompt-driven; streaming).
5. Wire event emission to the brain.
6. Build the progress dashboard (renders brain-supplied scores and short-term evolution).
7. Build the admin/debug dashboard (renders the brain's simulated long-term history).

(Brain-side steps — profile schema, decision engine, scoring, seeded personas, simulated-event generation — are in the companion document and proceed in parallel.)