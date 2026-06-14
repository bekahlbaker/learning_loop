# Onboarding — Component Spec

**Date:** 2026-06-14
**Scope:** All UI components required to render the onboarding flow in Learning Loop. Covers layout scaffolding, the step flow (phone-number login → OTP verification → name entry), the settings dashboard, and every input type required by the onboarding question set.

> **Revision note:** Onboarding is no longer a conversation. The chat thread and its components (`ChatContainer`, `ChatThread`, `ChatBubble`, `TypingIndicator`, `InputArea`) have been removed. Onboarding now runs as a short step flow (phone login → code verification → name) followed by a settings dashboard that surfaces every remaining onboarding question as an editable control preset to a sensible default. Lesson UI is out of scope for this spec.

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

## Question → Component Mapping

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
src/components/
  layouts/
    OnboardingLayout.tsx
  onboarding/
    OnboardingFlow.tsx
    OnboardingCard.tsx
    SettingsDashboard.tsx
    SettingsField.tsx
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
```

---

## 6. Dependencies to Install

| Package | Purpose |
|---|---|
| `react-datepicker` | `DateInput` calendar picker |
| `@types/react-datepicker` | TypeScript types |
| `react-phone-number-input` *(optional)* | US phone formatting in `PhoneInput`; can be replaced by a manual formatter |

---

## 7. Component Interaction Diagram

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