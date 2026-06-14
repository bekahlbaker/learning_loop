# Learning Loop — Component Spec

**Date:** 2026-06-14
**Scope:** All UI components required to render the onboarding flow AND the lesson session experience in Learning Loop. Covers layout scaffolding, the onboarding step flow (phone-number login → OTP verification → name entry), the settings dashboard, the flash-card session, every question type, and all answer and feedback primitives required for Wave 1.

> **Revision note (onboarding):** Onboarding is no longer a conversation. The chat thread and its components (`ChatContainer`, `ChatThread`, `ChatBubble`, `TypingIndicator`, `InputArea`) have been removed. Onboarding now runs as a short step flow (phone login → code verification → name) followed by a settings dashboard that surfaces every remaining onboarding question as an editable control preset to a sensible default.

> **Revision note (session):** The flash-card lesson session is now in scope. Sections 8–12 cover `SessionLayout`, `SessionOrchestrator`, the `useMockBrainDirective` hook, the `FlashCard` and its sub-components, `MultipleChoiceQuestion`, `TrueFalseQuestion`, `AnswerOption`, `HintReveal`, and `AnswerFeedback`. All components specify all four render states (loading, empty, error, success). The mock Brain directive drives tone and depth in Wave 1; the hook is swapped for a real API call in Wave 2.

---

## Design Conventions (applies to all components)

- **Border radius:** `rounded-2xl` (16px) on all containers, cards, inputs, and buttons
- **Shadows:** `shadow-sm` on interactive elements (buttons, inputs), `shadow-md` on cards
- **Colors:** Tailwind default palette only — no new custom colors. Neutrals (gray-100 through gray-800) for surfaces and borders; gray-300 for borders; white for input backgrounds
- **Typography:** Tailwind defaults
- **Breakpoints:** Mobile-first. `sm` = 640px (Tailwind default)
- **Focus:** All focusable elements must have `focus-ring` class (`shadow-focus-ring outline-none` on `:focus-visible`)
- **Motion:** Respect `prefers-reduced-motion` for all animations
- **Accessibility:** Semantic HTML, ARIA where semantic HTML is insufficient, keyboard navigation throughout

---

## Onboarding Phases & Defaults

The flow has three phases:

1. **Login** — phone-number entry → SMS code verification → validation.
2. **Name** — a single text input for the learner's name.
3. **Settings dashboard** — every remaining onboarding question rendered as an editable control, each preset to the middle/default of its range so the learner can simply confirm or adjust before continuing.

**Default preset rules (from the project plan).** Every settings control initializes to the middle/default of its range, never an extreme:

- **Slider 1–7** → preset to **4**
- **Slider 1–10** → preset to **5**
- **Other sliders** → the middle step of the range (e.g., daily time budget 5–30 → **15**)
- **OptionButtonGroup (four options)** → the **second option** (index 1); groups with a different option count default to the **middle option** of the list
- **DateInput (deadline)** → **no deadline** (skipped / `null`), since a date has no meaningful middle

---

## Question → Component Mapping (Onboarding)

| Question | Phase | Component | Default preset |
|---|---|---|---|
| Phone number | Login | `PhoneInput` | — (entered) |
| OTP code verification | Login | `OTPInput` | — (entered) |
| Name | Name | `TextInput` | — (entered) |
| Preferred time of day | Settings | `OptionButtonGroup` (in `SettingsField`) | second option |
| Completion deadline | Settings | `DateInput` w/ skip (in `SettingsField`) | no deadline |
| Daily time budget | Settings | `Slider` (in `SettingsField`) | 15 min (middle of 5–30) |
| Days per week | Settings | `Slider` | 4 (middle of 1–7) |
| Confidence level | Settings | `Slider` | 5 (middle of 1–10) |
| Restaurant experience | Settings | `OptionButtonGroup` | second option |
| Current role | Settings | `OptionButtonGroup` | second option |
| Existing certification | Settings | `OptionButtonGroup` | second option |
| Why taking this course | Settings | `OptionButtonGroup` | second option |
| Preferred learning style | Settings | `OptionButtonGroup` | second option |

---

## 1. Layout & Scaffolding

---

### `OnboardingLayout`

**Purpose:** Full-viewport page wrapper for the onboarding flow. Centers content, sets the background, constrains width.

**Location:** `src/components/layouts/OnboardingLayout.tsx`

**Props:**

```ts
export interface OnboardingLayoutProps {
  children: React.ReactNode
}
```

**Behavior:**
- Full viewport height (`min-h-screen`)
- White or gray-50 background
- Horizontally centered column, `max-w-lg` on `sm`+, full width on mobile
- Renders children (typically `OnboardingFlow`) within the centered column

**Notes:**
- Server Component — no interactivity at this level
- Export `metadata` for SEO from each page, not this component

---

### `OnboardingFlow`

**Purpose:** Top-level controller for the onboarding step machine. Owns which phase is on screen and the data collected so far, and renders the correct step. Replaces the old conversation parent.

**Location:** `src/components/onboarding/OnboardingFlow.tsx`

**Props:**

```ts
export type OnboardingStep = 'phone' | 'otp' | 'name' | 'settings'

export interface OnboardingProfile {
  name: string
  settings: SettingsValues   // see SettingsDashboard
}

export interface OnboardingFlowProps {
  onComplete: (profile: OnboardingProfile) => void
}
```

**Behavior:**
- Holds the current `OnboardingStep` and advances on each successful step:
  `phone` → `otp` → `name` → `settings`
- **phone:** renders an `OnboardingCard` wrapping `PhoneInput`; on submit, requests an SMS code and advances to `otp`
- **otp:** renders an `OnboardingCard` wrapping `OTPInput`; on a valid code advances to `name`; on an invalid code surfaces the error and allows resend
- **name:** renders an `OnboardingCard` wrapping `TextInput`; on submit stores the name and advances to `settings`
- **settings:** renders `SettingsDashboard`; on save, assembles `OnboardingProfile` and calls `onComplete`
- Each step transition may animate (fade/slide), skipped under `prefers-reduced-motion`

**Notes:**
- Client Component (`'use client'`) — owns step + collected-value state
- Only one step is mounted at a time
- The captured profile (name + settings) is what the loop hands to the brain to build the initial profile

---

### `OnboardingCard`

**Purpose:** Presentational card wrapper for a single login/name step — a titled, optionally-prompted card containing one input and optional footer actions.

**Location:** `src/components/onboarding/OnboardingCard.tsx`

**Props:**

```ts
export interface OnboardingCardProps {
  title: string
  prompt?: string
  children: React.ReactNode   // the step's input component
  footer?: React.ReactNode    // optional actions (e.g., a Button or ghost link)
}
```

**Behavior:**
- Renders `title` (prominent) and optional `prompt` (muted, gray-500) above the body
- Body holds the input; footer (if provided) sits below
- Centered within the layout column

**Styling:**
- `rounded-2xl`, white background, `shadow-md`, comfortable padding (`p-6`)

**Notes:**
- Pure presentational component — no state

---

## 2. Settings Dashboard

---

### `SettingsDashboard`

**Purpose:** Renders every remaining onboarding question as an editable control, each preset to its default. The learner can confirm or change any value, then continue.

**Location:** `src/components/onboarding/SettingsDashboard.tsx`

**Props:**

```ts
export interface SettingsValues {
  timeOfDay: string
  deadline: Date | null
  dailyTimeBudget: number
  daysPerWeek: number
  confidence: number
  restaurantExperience: string
  currentRole: string
  existingCertification: string
  reason: string
  learningStyle: string
}

export interface SettingsDashboardProps {
  initialValues?: Partial<SettingsValues>
  onSave: (values: SettingsValues) => void
}
```

**Behavior:**
- Initializes each field to its **default preset** (see *Onboarding Phases & Defaults*) unless overridden by `initialValues`
- Renders one `SettingsField` per question, in the order listed in the mapping table, each wrapping the appropriate control (`Slider`, `OptionButtonGroup`, or `DateInput`)
- Every control is freely editable — changing a value updates local state; nothing is locked after a first interaction
- A primary "Continue" `Button` at the bottom calls `onSave` with the full `SettingsValues`

**Styling:**
- Vertical stack of `SettingsField` rows with consistent spacing (`space-y-6`)
- Scrolls within the layout column if taller than the viewport; the Continue button sits at the end of the stack

**Notes:**
- Client Component — owns the working copy of the settings until save
- `aria-label` (e.g., "Onboarding settings") on the form region

---

### `SettingsField`

**Purpose:** A labeled row that pairs a question label/description with its control. The dashboard's per-question layout primitive (the settings equivalent of the old inline input switch).

**Location:** `src/components/onboarding/SettingsField.tsx`

**Props:**

```ts
export interface SettingsFieldProps {
  label: string
  description?: string
  children: React.ReactNode   // the control: Slider | OptionButtonGroup | DateInput
}
```

**Behavior:**
- Renders `label` (font-medium, gray-800) and optional `description` (gray-500) above the control
- Associates the label with the control for accessibility (`htmlFor` / wrapping `<label>` or `aria-labelledby`)

**Notes:**
- Pure presentational component — no state
- Does not know which control it wraps; the dashboard chooses the control per question

---

## 3. Input Components

These are used by the login/name steps (inside `OnboardingCard`, orchestrated by `OnboardingFlow`) and by the settings dashboard (inside `SettingsField`). No input renders itself inside a chat thread anymore.

---

### `TextInput`

**Purpose:** Single-line freeform text field. Used for the learner's name (name step).

**Location:** `src/components/inputs/TextInput.tsx`

**Props:**

```ts
export interface TextInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  autoFocus?: boolean
}
```

**Variants:**

| Variant | Width |
|---|---|
| Default | `w-full max-w-sm` |
| `fullWidth` | `w-full` |

**Behavior:**
- Submit on Enter key or by clicking the send/continue `Button`
- Trims whitespace before calling `onSubmit`
- Disabled state: `opacity-50 cursor-not-allowed`

**Styling:**
- `rounded-2xl`, gray-300 border, white background, `shadow-sm`
- Inline `Button` (primary, small) to the right of the field for submission

---

### `PhoneInput`

**Purpose:** US phone number entry with live formatting. The first step in the login flow.

**Location:** `src/components/inputs/PhoneInput.tsx`

**Props:**

```ts
export interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  disabled?: boolean
  error?: string
}
```

**Behavior:**
- Formats input as `(XXX) XXX-XXXX` on each keystroke
- Validates: exactly 10 US digits before enabling submit
- Displays `error` in red text below the field if provided (e.g., invalid number, number already in use)
- Submit on Enter or send button — this triggers the SMS code request

**Notes:**
- Fundamentally different from `TextInput` — has US-specific formatting logic and digit-only input filtering
- Consider `react-phone-number-input` with `country="US"` locked, or implement a lightweight formatter manually
- Do not use `TextInput` as a base — keep concerns separate

---

### `OTPInput`

**Purpose:** Multi-box one-time passcode entry for the SMS verification step.

**Location:** `src/components/inputs/OTPInput.tsx`

**Props:**

```ts
export interface OTPInputProps {
  length?: number               // defaults to 6
  onComplete: (code: string) => void
  onResend?: () => void
  disabled?: boolean
  error?: string
}
```

**Behavior:**
- Renders `length` individual single-character boxes in a row
- Auto-advances focus to the next box on each digit entry
- Backspace on an empty box moves focus back to the previous box
- Paste support: paste a full code string and it distributes across all boxes and auto-submits
- Calls `onComplete` as soon as all boxes are filled (auto-submit, no separate button needed) — `OnboardingFlow` validates the code and advances on success
- Shows `error` below if the code is invalid
- `onResend` renders as a ghost text link: "Resend code"

**Notes:**
- Fundamentally different from `TextInput` — compound multi-input, auto-advance, special paste behavior
- Each box: `w-10 h-12 rounded-2xl text-center border border-gray-300 shadow-sm text-lg`
- Boxes arranged in a flex row with `gap-2`
- `inputmode="numeric"` on each box

---

### `DateInput`

**Purpose:** Date picker for the completion-deadline question in the settings dashboard. Skippable.

**Location:** `src/components/inputs/DateInput.tsx`

**Props:**

```ts
export interface DateInputProps {
  value: Date | null
  onChange: (date: Date | null) => void
  onSkip?: () => void          // renders a "No deadline" option when provided
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  disabled?: boolean
}
```

**Behavior:**
- Wraps `react-datepicker` — no custom calendar built from scratch
- Reports changes via `onChange`; the dashboard persists the value on Continue (no per-field submit)
- Defaults to **no deadline** — when `onSkip` is provided, renders a secondary ghost button or text link: "I don't have a deadline"; choosing it sets the value to `null`
- `minDate` defaults to today (cannot set a deadline in the past)

**Styling:**
- The `react-datepicker` popup should be styled to match the onboarding card aesthetic — `rounded-2xl`, no sharp corners, `shadow-md`
- Override `.react-datepicker` class in a co-located CSS module or via `popperClassName` prop

---

### `Slider`

**Purpose:** Numeric range input with explicit increment/decrement buttons. Used in the settings dashboard for daily time budget (5–30 min), days per week (1–7), and confidence level (1–10).

**Location:** `src/components/inputs/Slider.tsx`

**Props:**

```ts
export interface SliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  formatLabel?: (value: number) => string   // e.g. value => `${value} min`
  disabled?: boolean
}
```

**Behavior:**
- `−` button on the far left, `+` button on the far right
- Current value displayed prominently between or above the track
- `−` is disabled (gray, not interactive) when `value === min`
- `+` is disabled when `value === max`
- Underlying `<input type="range">` is keyboard-accessible and visually styled
- Clicking `+` adds `step`; clicking `−` subtracts `step`; both clamp to `[min, max]`
- Reports changes via `onChange`; there is **no** per-slider confirm button — the dashboard's single Continue button persists all values
- Initial `value` is set by the dashboard to the control's default preset

**Styling:**
- Track: `rounded-full h-1.5 bg-gray-200` with a filled portion in gray-800 (or accent color)
- Thumb: `rounded-full w-4 h-4 bg-gray-800 shadow-sm` via `accent-color` or custom CSS
- `−` / `+` buttons: `rounded-2xl w-9 h-9 border border-gray-300 shadow-sm` (use `Button` variant `secondary`)

**Usage examples:**

| Question | min | max | step | default | formatLabel |
|---|---|---|---|---|---|
| Daily time budget | 5 | 30 | 5 | 15 | `v => \`${v} min\`` |
| Days per week | 1 | 7 | 1 | 4 | `v => \`${v} day${v > 1 ? 's' : ''}\`` |
| Confidence level | 1 | 10 | 1 | 5 | `v => String(v)` |

---

### `OptionButton`

**Purpose:** A single tappable answer option within a multi-choice settings question.

**Location:** `src/components/inputs/OptionButton.tsx`

**Props:**

```ts
export interface OptionButtonProps {
  label: string
  value: string
  onSelect: (value: string) => void
  selected?: boolean
  disabled?: boolean
}
```

**Variants:**

| Variant | Border | Background | Text |
|---|---|---|---|
| Default | gray-300 | white | gray-800 |
| `selected` | gray-800 (2px) | gray-50 | gray-900 |
| `disabled` | gray-200 | gray-50 | gray-400 |

**Behavior:**
- Tap: calls `onSelect(value)` and enters the `selected` state
- Selection is **changeable** — tapping a different option in the group moves the selection; the group is not locked after a first choice (these are editable settings)

**Styling:**
- `rounded-2xl`, `shadow-sm`, `py-3 px-4`, `w-full`, font-medium
- Hover: `bg-gray-50` (skipped under `prefers-reduced-motion`)
- Min height `44px` for touch targets

---

### `OptionButtonGroup`

**Purpose:** Lays out a set of `OptionButton` components in a responsive grid and manages single-selection state for a settings question.

**Location:** `src/components/inputs/OptionButtonGroup.tsx`

**Props:**

```ts
export interface OptionButtonGroupProps {
  options: Array<{ label: string; value: string }>
  onSelect: (value: string) => void
  selected?: string          // controlled; dashboard initializes to the default preset
  disabled?: boolean
}
```

**Layout:**
- Mobile: single column (`grid-cols-1`)
- `sm`+: two columns (`sm:grid-cols-2`)
- Gap: `gap-3`

**Behavior:**
- Controlled by `selected`; the dashboard seeds it with the default preset (the second option for four-option groups; the middle option otherwise)
- Calls `onSelect` whenever the learner picks an option, including changing a prior choice — selection remains editable
- When the count of options is odd (e.g., 3 or 5 options), the last item spans both columns on desktop: `sm:col-span-2`

**Notes:**
- Single-select only — no multi-select needed for this question set
- `role="radiogroup"` (single-select) with an `aria-label` describing the question for accessibility

---

## 4. General

---

### `Button`

**Purpose:** General-purpose action button. Used for form submission (TextInput send, settings Continue), the OTP resend link-style action, and other explicit actions.

**Location:** `src/components/buttons/Button.tsx`

**Props:**

```ts
export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'default' | 'small'
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}
```

**Variants:**

| Variant | Background | Border | Text |
|---|---|---|---|
| `primary` | gray-800 | none | white |
| `secondary` | white | gray-300 | gray-800 |
| `ghost` | transparent | none | gray-500 |

**Sizes:**

| Size | Padding | Font |
|---|---|---|
| `default` | `py-2.5 px-5` | `text-sm font-medium` |
| `small` | `py-1.5 px-3` | `text-xs font-medium` |

**Styling:**
- `rounded-2xl`, `shadow-sm` (primary and secondary), `transition-colors`
- Disabled: `opacity-50 cursor-not-allowed`
- `fullWidth`: `w-full`
- `focus-ring` on `:focus-visible`

---

## 5. Component Directory Map

```
app/components/
  layouts/
    OnboardingLayout.tsx
    SessionLayout.tsx         ← new (L3)
  onboarding/
    OnboardingFlow.tsx
    OnboardingCard.tsx
    SettingsDashboard.tsx
    SettingsField.tsx
  session/
    SessionOrchestrator.tsx   ← new (L3)
    FlashCard.tsx             ← new (L3)
    LessonContextHeader.tsx   ← new (L3)
    LessonContentBlock.tsx    ← new (L3)
    QuestionBlock.tsx         ← new (L3)
    MultipleChoiceQuestion.tsx← new (L3)
    TrueFalseQuestion.tsx     ← new (L3)
    AnswerOption.tsx          ← new (L3)
    HintReveal.tsx            ← new (L3)
    AnswerFeedback.tsx        ← new (L3)
  inputs/
    TextInput.tsx
    PhoneInput.tsx
    OTPInput.tsx
    DateInput.tsx
    Slider.tsx
    OptionButton.tsx
    OptionButtonGroup.tsx
  buttons/
    Button.tsx
app/hooks/
  useMockBrainDirective.ts    ← new (L3)
```

---

## 6. Dependencies to Install

| Package | Purpose |
|---|---|
| `react-datepicker` | `DateInput` calendar picker |
| `@types/react-datepicker` | TypeScript types |
| `react-phone-number-input` *(optional)* | US phone formatting in `PhoneInput`; can be replaced by a manual formatter |

---

## 7. Component Interaction Diagram (Onboarding)

```
OnboardingLayout
  └── OnboardingFlow            (step machine: phone → otp → name → settings)
        ├── OnboardingCard (phone step)
        │     └── PhoneInput
        ├── OnboardingCard (otp step)
        │     └── OTPInput
        ├── OnboardingCard (name step)
        │     └── TextInput
        └── SettingsDashboard
              ├── SettingsField × one per question
              │     └── Slider | OptionButtonGroup | DateInput
              │              └── OptionButton × N   (for OptionButtonGroup)
              └── Button (Continue)
```

**Flow:**
1. **Phone step** — learner enters their number → `PhoneInput` `onSubmit` → request SMS code → advance to OTP step.
2. **OTP step** — learner enters the code → `OTPInput` `onComplete` → validate; on success advance to name step, on failure show error and offer "Resend code".
3. **Name step** — learner enters their name → `TextInput` `onSubmit` → store name → advance to settings.
4. **Settings step** — `SettingsDashboard` renders every question preset to its default; learner confirms or changes any value → Continue → `onComplete` fires with `{ name, settings }`, which the loop hands to the brain to build the initial profile.

---

## 8. Session Layout & Orchestration

---

### `SessionLayout`

**Purpose:** Full-viewport page wrapper for the `/session` route. Sets the background and constrains width, analogous to `OnboardingLayout`.

**Location:** `app/components/layouts/SessionLayout.tsx`

**Props:**

```ts
export interface SessionLayoutProps {
  children: React.ReactNode
}
```

**Behavior:**
- Full viewport height (`min-h-screen`)
- gray-50 background
- Horizontally centered column, `max-w-lg` on `sm`+, full width on mobile
- No nav or chrome in Wave 1 — content fills the viewport

**Notes:**
- Server Component — no interactivity at this level

---

### `SessionOrchestrator`

**Purpose:** Top-level controller for the lesson session. Owns which lesson is active, the current answer state, and the mock Brain directive. Handles all four session-level states. In Wave 2, the mock directive hook is replaced by a real Brain API call.

**Location:** `app/components/session/SessionOrchestrator.tsx`

**Props:**

```ts
import type { PersonaId } from '@/app/types/brain'

export interface SessionOrchestratorProps {
  /**
   * Selects which cold-start persona drives the mock BrainDirective.
   * Defaults to 'new'. In Wave 2, replaced by a real user ID + Brain API call.
   */
  personaId?: PersonaId
}
```

**Session state machine:**

```
'loading' → 'active' → 'completed'
              ↓
           'error'
```

| State | What renders |
|---|---|
| `loading` | Skeleton version of `FlashCard` (full card shape, animated gray blocks) |
| `error` | Error message + retry button; used when curriculum fails to load |
| `active` | Current `FlashCard` driven by the active lesson + directive |
| `completed` | Session-end screen: brief summary, "Well done" message, link back to home |

**Behavior:**
- Loads `curriculum.json` on mount
- Tracks `currentLessonIndex` (starts at 0)
- Calls `useMockBrainDirective(personaId)` to get the active directive
- Passes `onAnswer` to `FlashCard`; on answer received → shows `AnswerFeedback` → on "Continue" → advances `currentLessonIndex`
- When all lessons in the level are exhausted → transitions to `completed`

**Notes:**
- Client Component (`'use client'`)
- The directive does not change between lessons in Wave 1 (single cold-start mock). In Wave 2, a new directive is requested after each lesson answer.

---

### `useMockBrainDirective`

**Purpose:** Returns a static `BrainDirective` seeded from a persona's cold-start values. Used throughout Wave 1. Swapped for a real API call in Wave 2.

**Location:** `app/hooks/useMockBrainDirective.ts`

**Signature:**

```ts
import type { BrainDirective, PersonaId } from '@/app/types/brain'

export function useMockBrainDirective(personaId: PersonaId): BrainDirective
```

**Behavior:**
- Reads the matching `LearnerPersona` from `PERSONAS_BY_ID`
- Returns a `BrainDirective` with:
  - `teachingTone` and `explanationDepth` from `persona.coldStart`
  - `directiveType` from `persona.coldStart.firstDirective`
  - `overallMastery: 0`, empty `masteryScores`, all flags `false`
  - `targetLessonId: null`, `targetLevelId: null`, `recommendedNextLessonId: null`
  - `rationale`: a human-readable description of the cold-start state (shown in the admin panel; never to the learner)
  - `issuedAt`: the current ISO 8601 timestamp

**Notes:**
- Pure derivation — no network calls, no side effects
- The return value is stable between renders (no internal state); the consumer re-calls if `personaId` changes

---

## 9. Flash Card

---

### `FlashCard`

**Purpose:** The primary lesson delivery surface. Renders level/lesson context at the top, lesson content in the middle, and the question with answer options at the bottom. Handles all four render states.

**Location:** `app/components/session/FlashCard.tsx`

**Props:**

```ts
import type { CurriculumLesson } from '@/app/types/curriculum'
import type { BrainDirective } from '@/app/types/brain'

export type FlashCardStatus = 'loading' | 'idle' | 'answered'

export interface FlashCardLevelContext {
  levelTitle: string
  lessonIndex: number   // 1-based display number within the level
  totalLessons: number
}

export interface FlashCardProps {
  lesson: CurriculumLesson | null
  directive: BrainDirective
  levelContext: FlashCardLevelContext
  status: FlashCardStatus
  onAnswer: (optionId: string, isCorrect: boolean, usedHint: boolean) => void
}
```

**Four render states:**

| State | Trigger | What renders |
|---|---|---|
| `loading` | `lesson` is `null` and curriculum is still fetching | Full-card skeleton: animated gray blocks in the shape of the header, content area, and question area |
| `idle` (empty guard) | `lesson` is `null` and curriculum has loaded with no lessons | Centered message: "No lessons available" with a muted gray-500 label; never shown in normal flow |
| `idle` | `lesson` is present | Full card: `LessonContextHeader` + `LessonContentBlock` + `HintReveal` + `QuestionBlock` |
| `answered` | `onAnswer` has been called | Card locked (all inputs `disabled`); `AnswerFeedback` appears below the card |

**Behavior:**
- Passes `directive.teachingTone` and `directive.explanationDepth` down to sub-components for future L4 use; sub-components accept but do not act on these values in Wave 1
- Tracks `usedHint` internally; flips to `true` the first time `HintReveal.onReveal` fires; passes this to `onAnswer`
- `status === 'answered'` disables `HintReveal` and passes `disabled` to `QuestionBlock`

**Styling:**
- `rounded-2xl`, white background, `shadow-md`, `p-5`
- `max-w-lg` width (matches layout column)
- Internal vertical stack: header → content → hint → question, `gap-5`

**Notes:**
- Client Component — owns `usedHint` state
- Error state is handled one level up by `SessionOrchestrator` (curriculum load failure); `FlashCard` itself never shows an error — it only reflects loading/idle/answered

---

### `LessonContextHeader`

**Purpose:** Displays the level and lesson position, overall mastery, and (for demo visibility) the current teaching tone. Sits at the top of every `FlashCard`.

**Location:** `app/components/session/LessonContextHeader.tsx`

**Props:**

```ts
import type { TeachingTone } from '@/app/types/brain'

export interface LessonContextHeaderProps {
  levelTitle: string
  lessonTitle: string
  lessonIndex: number     // 1-based
  totalLessons: number
  overallMastery: number  // 0–100 from BrainDirective
  teachingTone: TeachingTone
}
```

**Behavior:**
- Renders a breadcrumb-style label: `{levelTitle} · Lesson {lessonIndex} of {totalLessons}`
- Renders the lesson title below in slightly larger, bolder type
- Mastery pill: `{overallMastery}% mastery` — gray-100 background, gray-700 text; omitted when `overallMastery === 0` (cold start)
- Tone badge: small pill showing the current `teachingTone` value (e.g., "encouraging", "challenging") — visible for demo purposes; styled in a muted gray, never in the learner's primary visual path

**Styling:**
- Horizontal flex row: left-aligned breadcrumb + lesson title stacked; mastery pill and tone badge right-aligned
- `text-xs text-gray-500` for breadcrumb; `text-sm font-semibold text-gray-900` for lesson title
- Tone badge: `text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500`

**Notes:**
- Pure presentational — no state

---

### `LessonContentBlock`

**Purpose:** Renders the lesson's content — either a text body or an image. Handles a loading state for when the lesson is being fetched.

**Location:** `app/components/session/LessonContentBlock.tsx`

**Props:**

```ts
import type { LessonContent } from '@/app/types/curriculum'

export interface LessonContentBlockProps {
  content: LessonContent
  loading?: boolean
}
```

**Four render states:**

| State | Trigger | What renders |
|---|---|---|
| `loading` | `loading === true` | Animated skeleton rectangle, `h-24 rounded-xl bg-gray-100` |
| `text` | `content.type === 'text'` | `<p>` with prose styling (`text-sm text-gray-700 leading-relaxed`) |
| `image` | `content.type === 'image'` | `next/image` with `src={content.imageUrl}`, `alt={content.imageAlt}`, `rounded-xl`, `object-cover`; aspect ratio `4/3` |
| `empty` (guard) | `content` is somehow undefined | Hidden in practice; defensively renders nothing with no layout impact |

**Notes:**
- Server-renderable shape, but declared as a Client Component if the parent is; no interactivity of its own
- Image `sizes` prop: `"(max-width: 640px) 100vw, 512px"` to match layout column width

---

## 10. Question Components

The curriculum defines two question types. The project summary's "scenario-based" questions use `multiple_choice` with a longer narrative prompt — no separate component is needed. "Knowledge check" maps to `true_false`. `QuestionBlock` dispatches to the correct component based on `question.type`.

### Question → Component Mapping (Session)

| Curriculum `question.type` | Project summary label | Component | Notes |
|---|---|---|---|
| `multiple_choice` | Multiple choice, Scenario-based | `MultipleChoiceQuestion` | Scenario questions have a longer prompt; same component |
| `true_false` | Knowledge check | `TrueFalseQuestion` | Two fixed options: True / False |

---

### `QuestionBlock`

**Purpose:** Discriminated-union dispatcher. Reads `question.type` and renders the correct question component. Keeps `FlashCard` free of type-switching logic.

**Location:** `app/components/session/QuestionBlock.tsx`

**Props:**

```ts
import type { CurriculumQuestion } from '@/app/types/curriculum'
import type { ExplanationDepth } from '@/app/types/brain'

export interface QuestionBlockProps {
  question: CurriculumQuestion
  onAnswer: (optionId: string, isCorrect: boolean) => void
  disabled?: boolean
  explanationDepth: ExplanationDepth  // passed through to question component; reserved for L4
}
```

**Behavior:**
- `question.type === 'multiple_choice'` → renders `MultipleChoiceQuestion`
- `question.type === 'true_false'` → renders `TrueFalseQuestion`
- TypeScript exhaustiveness check ensures new question types surface as a compile error

**Notes:**
- No state of its own; purely structural

---

### `MultipleChoiceQuestion`

**Purpose:** Renders a multiple-choice question: the prompt, then a vertical list of selectable `AnswerOption` components. Handles selection, locks options after submission, and reports the result.

**Location:** `app/components/session/MultipleChoiceQuestion.tsx`

**Props:**

```ts
import type { MultipleChoiceQuestion as MCQ } from '@/app/types/curriculum'
import type { ExplanationDepth } from '@/app/types/brain'

export interface MultipleChoiceQuestionProps {
  question: MCQ
  onAnswer: (optionId: string, isCorrect: boolean) => void
  disabled?: boolean
  explanationDepth: ExplanationDepth  // reserved for L4 AI teacher; accepted but unused in L3
}
```

**Four render states:**

| State | Trigger | What renders |
|---|---|---|
| `loading` | n/a — question data is always present when this component mounts | n/a (loading is handled by `FlashCard`) |
| `idle` (empty guard) | `question.options` is empty | "No options available" muted label; not reachable in practice with valid curriculum data |
| `unanswered` | No option selected yet | Prompt text + all `AnswerOption`s in `idle` state |
| `answered` | An option has been selected | Selected option shows `correct` or `incorrect` state; all other options show `idle` and are `disabled`; `onAnswer` has been called |

**Behavior:**
- Tracks `selectedOptionId` internally; `null` until the learner taps an option
- On option tap: sets `selectedOptionId`, determines `isCorrect` by comparing to `question.correctOptionId`, calls `onAnswer(optionId, isCorrect)`, then sets all options to their final states
- Once answered (`disabled === true` from parent), all `AnswerOption`s are non-interactive

**Styling:**
- Prompt: `text-sm font-medium text-gray-800 mb-3`
- Options: vertical `flex flex-col gap-2`

**Notes:**
- Client Component — owns `selectedOptionId` state

---

### `TrueFalseQuestion`

**Purpose:** Renders a true/false question: the prompt, then two fixed `AnswerOption` buttons — "True" and "False".

**Location:** `app/components/session/TrueFalseQuestion.tsx`

**Props:**

```ts
import type { TrueFalseQuestion as TFQ } from '@/app/types/curriculum'
import type { ExplanationDepth } from '@/app/types/brain'

export interface TrueFalseQuestionProps {
  question: TFQ
  onAnswer: (answer: boolean, isCorrect: boolean) => void
  disabled?: boolean
  explanationDepth: ExplanationDepth  // reserved for L4; accepted but unused in L3
}
```

**Four render states:**

| State | Trigger | What renders |
|---|---|---|
| `loading` | n/a | n/a (handled by `FlashCard`) |
| `idle` (empty guard) | n/a | n/a (both options are always present) |
| `unanswered` | No selection yet | Prompt + two `AnswerOption`s ("True", "False") in `idle` state, side by side |
| `answered` | An option selected | Chosen option shows `correct`/`incorrect`; other option `disabled` |

**Behavior:**
- Derives `isCorrect` by comparing the selected boolean to `question.correctAnswer`
- Calls `onAnswer(selectedBoolean, isCorrect)` on tap
- Maps `true` → `optionId: 'true'` and `false` → `optionId: 'false'` when constructing `AnswerOption` props

**Styling:**
- Prompt: `text-sm font-medium text-gray-800 mb-3`
- Options: horizontal `flex gap-3`; each option `flex-1` so they share equal width

**Notes:**
- Client Component — owns selection state

---

## 11. Answer & Feedback Primitives

---

### `AnswerOption`

**Purpose:** A single tappable answer option. Used by both `MultipleChoiceQuestion` (as a list item) and `TrueFalseQuestion` (as one of two side-by-side buttons). Visual state changes to reflect idle, selected (processing), correct, or incorrect.

**Location:** `app/components/session/AnswerOption.tsx`

**Props:**

```ts
export type AnswerOptionState = 'idle' | 'selected' | 'correct' | 'incorrect'

export interface AnswerOptionProps {
  text: string
  optionId: string
  onSelect: (optionId: string) => void
  state: AnswerOptionState
  disabled?: boolean
}
```

**States:**

| State | Border | Background | Text | Icon |
|---|---|---|---|---|
| `idle` | gray-300 (1px) | white | gray-800 | none |
| `selected` | gray-600 (2px) | gray-50 | gray-900 | none |
| `correct` | green-500 (2px) | green-50 | green-800 | ✓ (right-aligned) |
| `incorrect` | red-400 (2px) | red-50 | red-800 | ✕ (right-aligned) |
| `disabled` (any state) | gray-200 (1px) | gray-50 | gray-400 | — |

**Behavior:**
- Tap → calls `onSelect(optionId)` if `disabled` is false and `state === 'idle'`
- No internal state — fully controlled by the parent question component
- Min height 44px for touch targets
- `role="radio"` within a `role="radiogroup"` in the parent; `aria-checked` reflects selection

**Styling:**
- `rounded-2xl`, `shadow-sm`, `py-3 px-4`, `w-full`, `text-sm font-medium`
- Icon rendered as `aria-hidden` SVG on the right side of the text row
- `transition-colors duration-150`; motion skipped under `prefers-reduced-motion`
- `focus-ring` on `:focus-visible`

---

### `HintReveal`

**Purpose:** An expandable hint that the learner can show before submitting an answer. Fires a callback on first reveal so that hint usage can be tracked as a behavioral event in L5.

**Location:** `app/components/session/HintReveal.tsx`

**Props:**

```ts
export interface HintRevealProps {
  hint: string
  onReveal?: () => void  // fires exactly once, on the first time the hint is shown
  disabled?: boolean     // prevents toggle after answer is submitted
}
```

**Behavior:**
- Renders a toggle button: "Show hint" when collapsed, "Hide hint" when expanded
- On first expand: calls `onReveal()` once and only once (tracked via internal `hasRevealed` ref)
- Subsequent toggles do not re-fire `onReveal`
- When `disabled`, the hint is collapsed and the toggle button is non-interactive

**Styling:**
- Toggle: `ghost` `Button`, `text-xs text-gray-500`, left-aligned below the content block
- Revealed hint: `rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 italic mt-1`
- Expand/collapse animation: `max-height` transition, skipped under `prefers-reduced-motion`

**Notes:**
- Client Component — owns `isOpen` and `hasRevealed` state

---

### `AnswerFeedback`

**Purpose:** Shown below the card after the learner submits an answer. Displays a correct/incorrect result, a brief message, and a "Continue" button that advances to the next lesson.

**Location:** `app/components/session/AnswerFeedback.tsx`

**Props:**

```ts
import type { TeachingTone } from '@/app/types/brain'

export interface AnswerFeedbackProps {
  isCorrect: boolean
  teachingTone: TeachingTone  // reserved for L4 AI teacher framing; accepted but unused in L3
  onContinue: () => void
}
```

**Four render states:**

| State | Trigger | What renders |
|---|---|---|
| `loading` | n/a in Wave 1 (static feedback); will be used in L4 when AI response streams in | Skeleton text line + disabled Continue button |
| `empty` | n/a — feedback is always present after an answer | n/a |
| `correct` | `isCorrect === true` | Green indicator, affirmative message, Continue button |
| `incorrect` | `isCorrect === false` | Red indicator, gentle correction message, Continue button |

**Behavior:**
- In Wave 1: renders a static localized message for correct/incorrect from `en.json`
- In L4: the message area will be replaced by AI-streamed teacher explanation; the component shape remains the same
- "Continue" button calls `onContinue` and is always enabled (no answer to wait for in L3)

**Styling:**
- `rounded-2xl`, `shadow-sm`, `p-4 mt-3`
- Correct: `bg-green-50 border border-green-200`; text `text-green-800`
- Incorrect: `bg-red-50 border border-red-400`; text `text-red-800`
- Result indicator: filled circle icon (✓ or ✕), `aria-hidden`, left of the message text
- Continue button: primary `Button`, `fullWidth`, below the message

**Notes:**
- Pure presentational in Wave 1 — no state beyond what's passed in

---

## 12. Component Interaction Diagram (Session)

```
SessionLayout
  └── SessionOrchestrator         (state: loading | active | completed | error)
        │  useMockBrainDirective() → BrainDirective
        │
        ├── [loading]  FlashCard status="loading"
        │              └── skeleton blocks
        │
        ├── [error]    error message + retry Button
        │
        ├── [active]   FlashCard status="idle" | "answered"
        │              ├── LessonContextHeader
        │              ├── LessonContentBlock        (text | image | loading skeleton)
        │              ├── HintReveal                (collapsed by default)
        │              └── QuestionBlock
        │                    ├── MultipleChoiceQuestion
        │                    │     └── AnswerOption × N  (idle → correct | incorrect)
        │                    └── TrueFalseQuestion
        │                          └── AnswerOption × 2  (True | False)
        │
        └── [answered] AnswerFeedback (below FlashCard)
                        └── Button (Continue → next lesson)
```

**Flow:**

1. `SessionOrchestrator` mounts → enters `loading` state → loads `curriculum.json` → resolves to `active`.
2. The active lesson and mock directive are passed to `FlashCard` with `status="idle"`.
3. Learner optionally expands `HintReveal` (fires `onReveal`, tracked for L5 event emission).
4. Learner selects an answer → `QuestionBlock` determines correctness → calls `FlashCard.onAnswer(optionId, isCorrect, usedHint)`.
5. `SessionOrchestrator` receives the answer → sets `FlashCard` to `status="answered"` (locks card) → renders `AnswerFeedback`.
6. Learner taps "Continue" → `SessionOrchestrator` advances `currentLessonIndex` → new `FlashCard` renders.
7. When all lessons are exhausted → `SessionOrchestrator` transitions to `completed`.

**Brain directive influence (Wave 1 → Wave 2):**

| Directive field | Wave 1 (mock) | Wave 2 (real Brain) |
|---|---|---|
| `teachingTone` | Shown as demo badge in `LessonContextHeader`; passed to `AnswerFeedback` but unused | AI teacher (L4) uses tone to frame explanation |
| `explanationDepth` | Passed through to question components; unused | AI teacher uses depth to adjust verbosity |
| `directiveType` | Ignored; lessons play in order | Drives routing (skip, review, repeat) |
| `overallMastery` | Shown as pill in `LessonContextHeader` | Updated after each lesson answer |