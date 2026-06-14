# Adaptive Learning Coach Platform — Learning Loop

## Project Context

This describes the product vision, architecture, scope, and the contract between the Learning Loop and the Brain — context that is essential before working on any feature.

---

## Scope of This Document

This summary covers the Learning Loop — the learner-facing adaptive teaching experience and the application that delivers it, with an LLM acting as the teacher.

All decision-making, scoring, profile computation, and behavior-driven adaptation — collectively "the brain" — are deliberately out of scope here and live in the companion Decision & Adaptation Layer document. The Learning Loop treats the brain as a separate component it integrates with through a clean contract:

- The loop emits behavioral events as the learner interacts.
- The brain returns directives, mastery scores, profile updates, and recommendations.
- The loop renders those results into teaching and UI.
- The loop never decides or scores. The brain never speaks to the learner.

---

## Vision

Deliver a learning experience that feels like a personal teacher rather than a traditional LMS: conversational, responsive, and tailored in tone and pacing to the individual.

Instead of pushing every learner through the same fixed Lesson → Quiz → Pass → Next path, the experience adapts to how the learner actually behaves in it. The Learning Loop is responsible for observing the learner, delivering instruction, and presenting the adapted experience. The decisions about how to adapt — based on observed behavior — are made by the separate adaptation component (the brain) documented in the companion summary.

The system does not simply present content — it adapts the experience to the individual. (How that adaptation is decided is the subject of the companion document.)

---

## Goals

### Immediate Goal

A validation-first proof of concept that, on the experience side, demonstrates:

- Conversational onboarding
- Adaptive lesson delivery
- Personalized teaching styles and tone
- A learner-facing progression experience
- Visibly different journeys for different learners (driven by the brain, rendered by the loop)
- Profile and progress visualization, including evolution over time

### What "Production-Quality PoC" Means

When production quality conflicts with validation speed, validation wins. "Production-quality" means clean code and patterns at a small, well-structured scope that could be grown later — not production architecture, scale, or analytics.

### Long-Term Goal

The learning coach can grow into a real learning product, but it is also the controlled domain in which the team demonstrates a broader capability: building products whose experience adapts to how people actually behave in them. The lasting asset is the team's skill at building and proving these adaptive experiences — not a reusable model or platform. That framing is detailed in the companion document.

---

## The Experience Loop

```
Observe → [Build Profile] → Deliver → [Measure / Adjust] → Continue
```

The Learning Loop owns **Observe** (capturing events), **Deliver** (teaching), **Continue**, and all rendering. The bracketed steps — building the profile and measuring/adjusting — are performed by the brain; the loop simply hands over events and renders what comes back.

---

## Key Features

### Conversational Onboarding

Onboarding happens through a guided conversation rather than a form (e.g., Are you new to this topic? How confident are you? What are your goals? Do you have a deadline? How much time can you spend daily?). The loop captures these answers and passes them to the brain, which builds the initial profile.

### Adaptive Lesson Delivery

Lessons are delivered conversationally. The loop renders the brain's chosen content, format, and explanation depth. Only structured question types are delivered (multiple choice, scenario-based, knowledge checks); free-form responses are excluded from the PoC.

### The Teacher (LLM Layer)

On its own, the LLM is the instruction and presentation layer — the part the learner actually talks to. It handles the conversational onboarding, delivers lessons in natural language, explains concepts, phrases hints, varies the pacing and warmth of delivery, and adapts its voice to the learner: patient and encouraging for a nervous beginner, terse and challenging for an expert. What it owns is **how things are said**, never **what happens next**. It does not score answers, does not decide whether to advance or review, and does not update the profile. Confining it to communication is deliberate — that's the layer where fluency and tone genuinely matter, and where nondeterminism is acceptable precisely because nothing it says changes the system's state by itself.

In the loop, the LLM is the brain's mouthpiece. The brain hands it a structured directive — something like "concept: knife safety; learner is struggling, low confidence; explain simply, use a concrete worked example, encouraging tone," or "high performer, skip the intro, be brief, pose a challenge" — and the LLM turns that directive into the teaching the learner reads. It renders intent into language. Anything the interaction produces (an answer, a hint request, a silence, an abandonment) is captured as events and passed back to the brain, which decides the next directive. The contract is strict and one-directional on decisions: **the brain decides, the LLM expresses**, and the LLM never overrides the brain's scoring or routing.

The stack is a strong hosted foundation model reached by API — consistent with the "best model, quality over cost" decision — driven by well-designed prompts rather than fine-tuning to start. A system prompt encodes the teaching persona and the rules of engagement, while the brain's directive and the learner profile are passed in on each call, with structured outputs used wherever a response needs to be machine-readable. Responses are streamed so the live demo feels responsive despite a larger model's latency. The build begins with prompt templates per directive type, light validation and guardrails on output, and human review of the generated explanations for the small demo course, since correctness still rides on the model. Fine-tuning is deferred until there's a corpus of good teaching examples and a real need for consistency, lower cost, or speed — it's an optimization, not a starting point.

### Progress Visualization

Learners can see a roadmap, completed lessons, current mastery (value from the brain), recommended next steps (from the brain), and the content library.

### Profile Evolution Views (Display Only)

- **Short-term — during the session:** the audience watches the experience change live as the brain reacts (e.g., a recommendation shifts after a run of misses).
- **Long-term — simulated history:** an admin panel renders an accelerated arc (e.g., Day 1 → Day 30) built from stored events.

Both are visualizations; the underlying values and the simulated history are produced by the brain.

---

## Technical Architecture (Loop)

### Frontend

- **Stack:** Next.js, React, TypeScript, TailwindCSS, React Query
- **Core screens:**
  - Onboarding Conversation
  - Learning Session
  - Progress Dashboard
  - Admin / Debug Dashboard (renders the brain's data, including the simulated-history view)

### Backend (Loop-Owned)

- **Stack:** Node.js, Next.js API Routes, PostgreSQL, Prisma ORM (shared store)
- **Loop services:**
  - AI Teacher Service — prompts the foundation model, renders directives into teaching
  - Session / Conversation orchestration — runs the live interaction
  - Event capture — emits Learning Events to the brain
  - Progress / Profile presentation — displays brain-supplied scores and profile state

*(Decision Engine, mastery scoring, and profile computation are brain services — see the companion document.)*

### AI / Teacher Layer

Use a strong existing foundation model — quality over cost — reached by API and driven by prompts (not fine-tuning) for the PoC. Responses are streamed so the live demo stays responsive. The AI acts as teacher, coach, and presenter only; it makes no business decisions and does not grade.

### Contract With the Brain

The loop sends events and a "what's next?" request; the brain returns a directive plus updated scores/profile; the loop renders the result. The brain is the source of truth for state and routing.

---

## Data Model (Loop-Owned / Shared)

| Entity | Owner | Notes |
|---|---|---|
| Users | Loop | Account information |
| Lessons | Loop | Content, concepts, prerequisites, assessments (team-authored) |
| Progress | Loop | Completion and status; mastery score value comes from the brain |
| Learning Events | Loop (emits) / Brain (consumes) | Captured as the learner acts (answered correctly/incorrectly, requested help, abandoned lesson, etc.) |
| Learner Profile | Brain | Store and schema owned by the brain |

---

## Content Scope

5–10 lessons on a single simple topic, structured into concepts, prerequisites, and assessments. Structured question types only. Because explanation correctness rides on the LLM, content review of the small demo course remains important.

---

## Risks (Loop)

### AI Hallucinations / Explanation Correctness

The LLM teacher can produce incorrect or inconsistent explanations. **Mitigation:** structured outputs, content review of the demo course, and exclusion of free-form grading (a brain concern — see companion doc). Explanation correctness still depends on the model.

### Demo Latency

"Best available model" often means slower responses, which matters in a live demo. **Mitigation:** stream responses; treat perceived responsiveness as a UX requirement distinct from cost.

### Feature Creep

**Mitigation:** validation wins over production quality; scope is deliberately minimal.

*(Data privacy and over-personalization are primarily brain-stage concerns and are covered in the companion document.)*

---

## Recommended PoC Scope (Loop)

- **Course:** one simple, self-authored topic
- **Lessons:** 5–10 maximum
- **Personas:** three seeded learners (Experienced, New, Disengaged) — divergence driven by the brain
- **Audience:** internal leadership
- **Core demonstration (loop-side):** conversational onboarding → render the brain's directive as teaching → present questions (structured types) → emit events → display the brain's recommendation, updated mastery, and progress → show short-term (live) and long-term (simulated) profile evolution

---

## Success Criteria (Loop)

Internal leadership can clearly see that:

- The experience feels like a responsive personal teacher, not a static LMS.
- The same content produces visibly different experiences for different learners (decisions from the brain, rendered live).
- Both the live session and the long-term view are legible and compelling.
- The clean, minimal architecture could grow into a real product and demonstrates a capability the team can apply to other products: experiences that adapt to real user behavior.

*(Criteria about decision correctness, the adaptation logic, and how its lift is validated are in the companion document.)*
