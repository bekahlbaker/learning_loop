# Conversational Onboarding — Component Spec

**Date:** 2026-06-13  
**Scope:** All UI components required to render the conversational onboarding flow in Learning Loop. Covers layout scaffolding, the chat thread, and every input type required by the onboarding question set.

---

## Design Conventions (applies to all components)

- **Border radius:** `rounded-2xl` (16px) on all containers, cards, inputs, and buttons
- **Shadows:** `shadow-sm` on interactive elements (buttons, inputs), `shadow-md` on cards/bubbles
- **Colors:** Tailwind default palette only — no new custom colors. Neutrals (gray-100 through gray-800) for surfaces and borders; gray-300 for borders; white for input backgrounds
- **Typography:** Tailwind defaults
- **Breakpoints:** Mobile-first. `sm` = 640px (Tailwind default)
- **Focus:** All focusable elements must have `focus-ring` class (`shadow-focus-ring outline-none` on `:focus-visible`)
- **Motion:** Respect `prefers-reduced-motion` for all animations
- **Accessibility:** Semantic HTML, ARIA where semantic HTML is insufficient, keyboard navigation throughout

---

## Question → Component Mapping

| Question | Component |
|---|---|
| Name | `TextInput` |
| Phone number | `PhoneInput` |
| OTP code verification | `OTPInput` |
| Preferred time of day | `OptionButtonGroup` |
| Completion deadline | `DateInput` (with skip) |
| Daily time budget | `Slider` |
| Days per week | `Slider` |
| Confidence level | `Slider` |
| Restaurant experience | `OptionButtonGroup` |
| Current role | `OptionButtonGroup` |
| Existing certification | `OptionButtonGroup` |
| Why taking this course | `OptionButtonGroup` |
| Preferred learning style | `OptionButtonGroup` |

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
- Renders children (typically `ChatContainer`) at full height within the column

**Notes:**
- Server Component — no interactivity at this level
- Export `metadata` for SEO from each page, not this component

---

### `ChatContainer`

**Purpose:** Splits the onboarding screen into a scrollable message thread (top) and a pinned input zone (bottom). The single structural component a page wires together.

**Location:** `src/components/chat/ChatContainer.tsx`

**Props:**

```ts
export interface ChatContainerProps {
  thread: React.ReactNode    // ChatThread
  input: React.ReactNode     // InputArea or null
}
```

**Behavior:**
- Thread area fills available vertical space, `overflow-y-auto`
- Input area is pinned to the bottom of the viewport (sticky footer inside the column)
- Exposes a `ref` or scroll utility so `ChatThread` can trigger auto-scroll to bottom

**Notes:**
- Client Component (`'use client'`) — manages scroll state
- Padding at bottom of thread prevents last bubble from hiding behind the input zone

---

## 2. Conversation Thread

---

### `ChatThread`

**Purpose:** Ordered list of all chat messages in the current conversation. Renders `ChatBubble` and `TypingIndicator` nodes.

**Location:** `src/components/chat/ChatThread.tsx`

**Props:**

```ts
export interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export interface ChatThreadProps {
  messages: Message[]
  isTyping: boolean
}
```

**Behavior:**
- Maps `messages` to `ChatBubble` components
- When `isTyping` is true, appends a `TypingIndicator` at the bottom
- Auto-scrolls to the bottom whenever `messages` or `isTyping` changes (via `useEffect` + `scrollIntoView` on the last element)

**Notes:**
- Client Component
- Role determines bubble alignment and color (passed to `ChatBubble`)
- List items should have a stable `key` (message `id`)
- `aria-live="polite"` on the thread container so screen readers announce new messages

---

### `ChatBubble`

**Purpose:** A single message bubble. Styled differently for the LLM (`assistant`) and the learner (`user`).

**Location:** `src/components/chat/ChatBubble.tsx`

**Props:**

```ts
export interface ChatBubbleProps {
  role: 'assistant' | 'user'
  children: React.ReactNode
  className?: string
}
```

**Variants:**

| Variant | Alignment | Background | Text | Shadow |
|---|---|---|---|---|
| `assistant` | Left | white | gray-800 | `shadow-md` |
| `user` | Right | gray-800 | white | `shadow-sm` |

**Behavior:**
- `rounded-2xl` on all corners; optionally flatten the sending-side bottom corner (`rounded-bl-sm` for user, `rounded-br-sm` for assistant) for a classic chat aesthetic
- Max width `max-w-[80%]` to prevent bubbles spanning full width
- Entrance animation: fade + slight upward translate (300ms, skipped under `prefers-reduced-motion`)

**Notes:**
- Pure presentational component — no state
- Children are `ReactNode` to support both plain text and formatted content

---

### `TypingIndicator`

**Purpose:** Three animated dots shown inside an assistant bubble while the LLM is "thinking." Shown for approximately 3 seconds before the real assistant message appears.

**Location:** `src/components/chat/TypingIndicator.tsx`

**Props:**

```ts
export interface TypingIndicatorProps {
  className?: string
}
```

**Behavior:**
- Renders three dots with a staggered bounce animation (each dot offset ~150ms)
- Appears in an `assistant`-styled `ChatBubble` wrapper so it matches the assistant style
- The parent (`ChatThread`) shows/hides it via the `isTyping` prop — this component owns only the animation

**Animation:**
```css
/* Three dots, staggered: delay 0ms, 150ms, 300ms */
@keyframes bounce { 0%, 80%, 100% { transform: translateY(0) } 40% { transform: translateY(-6px) } }
```

**Notes:**
- `aria-label="Assistant is typing"` on the wrapper
- `role="status"` so screen readers announce it

---

## 3. Input Components

All input components are rendered inline by `InputArea` below the most recent assistant bubble. When a learner submits, the input disappears and their answer appears as a user `ChatBubble`.

---

### `InputArea`

**Purpose:** The active input zone below the last assistant bubble. Acts as the switch that renders the correct input component for the current question type.

**Location:** `src/components/chat/InputArea.tsx`

**Props:**

```ts
export type InputType = 'text' | 'phone' | 'otp' | 'date' | 'slider' | 'options'

export interface InputAreaProps {
  type: InputType
  onSubmit: (value: string | number | Date) => void
  inputProps?: Record<string, unknown>  // forwarded to child input component
}
```

**Behavior:**
- Renders the correct child component based on `type`
- Handles the visual fade-out transition after submission
- Does not persist the input after submission — parent manages conversation state

**Notes:**
- Client Component
- Only one `InputArea` is active at a time — the parent unmounts previous ones when moving to the next question

---

### `TextInput`

**Purpose:** Single-line freeform text field. Used for the learner's name.

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
- Submit on Enter key or by clicking the send `Button`
- Trims whitespace before calling `onSubmit`
- Disabled state: `opacity-50 cursor-not-allowed`

**Styling:**
- `rounded-2xl`, gray-300 border, white background, `shadow-sm`
- Inline `Button` (primary, small) to the right of the field for submission

---

### `PhoneInput`

**Purpose:** US phone number entry with live formatting. Used as the first step in the OTP authentication flow.

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
- Submit on Enter or send button

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
- Calls `onComplete` as soon as all boxes are filled (auto-submit, no separate button needed)
- Shows `error` below if the code is invalid
- `onResend` renders as a ghost text link: "Resend code"

**Notes:**
- Fundamentally different from `TextInput` — compound multi-input, auto-advance, special paste behavior
- Each box: `w-10 h-12 rounded-2xl text-center border border-gray-300 shadow-sm text-lg`
- Boxes arranged in a flex row with `gap-2`
- `inputmode="numeric"` on each box

---

### `DateInput`

**Purpose:** Date picker for the completion deadline question. Optionally skippable.

**Location:** `src/components/inputs/DateInput.tsx`

**Props:**

```ts
export interface DateInputProps {
  value: Date | null
  onChange: (date: Date | null) => void
  onSubmit: (date: Date | null) => void
  onSkip?: () => void          // renders a "No deadline" skip option when provided
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  disabled?: boolean
}
```

**Behavior:**
- Wraps `react-datepicker` — no custom calendar built from scratch
- When a date is selected, enables the submit `Button`
- When `onSkip` is provided, renders a secondary ghost button or text link below: "I don't have a deadline"
- Clicking skip calls `onSkip()` and submits `null` as the date value
- `minDate` defaults to today (cannot set a deadline in the past)

**Styling:**
- The `react-datepicker` popup should be styled to match the chat aesthetic — `rounded-2xl`, no sharp corners, `shadow-md`
- Override `.react-datepicker` class in a co-located CSS module or via `popperClassName` prop

---

### `Slider`

**Purpose:** Numeric range input with explicit increment/decrement buttons. Used for daily time budget (5–30 min), days per week (1–7), and confidence level (1–10).

**Location:** `src/components/inputs/Slider.tsx`

**Props:**

```ts
export interface SliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  onSubmit: (value: number) => void
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
- A confirm `Button` (primary) below submits the current value

**Styling:**
- Track: `rounded-full h-1.5 bg-gray-200` with a filled portion in gray-800 (or accent color)
- Thumb: `rounded-full w-4 h-4 bg-gray-800 shadow-sm` via `accent-color` or custom CSS
- `−` / `+` buttons: `rounded-2xl w-9 h-9 border border-gray-300 shadow-sm` (use `Button` variant `secondary`)

**Usage examples:**

| Question | min | max | step | formatLabel |
|---|---|---|---|---|
| Daily time budget | 5 | 30 | 5 | `v => \`${v} min\`` |
| Days per week | 1 | 7 | 1 | `v => \`${v} day${v > 1 ? 's' : ''}\`` |
| Confidence level | 1 | 10 | 1 | `v => String(v)` |

---

### `OptionButton`

**Purpose:** A single tappable answer option within a multi-choice question.

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
- Single tap: calls `onSelect(value)` and visually enters `selected` state
- Once any option in the group is selected, all buttons are disabled (managed by `OptionButtonGroup`)
- No toggle — selection is final; the group then disappears and the answer appears as a user `ChatBubble`

**Styling:**
- `rounded-2xl`, `shadow-sm`, `py-3 px-4`, `w-full`, font-medium
- Hover: `bg-gray-50` (skipped under `prefers-reduced-motion`)
- Min height `44px` for touch targets

---

### `OptionButtonGroup`

**Purpose:** Lays out a set of `OptionButton` components in a responsive grid. Manages single-selection state and disables the group after a selection is made.

**Location:** `src/components/inputs/OptionButtonGroup.tsx`

**Props:**

```ts
export interface OptionButtonGroupProps {
  options: Array<{ label: string; value: string }>
  onSelect: (value: string) => void
  selected?: string
  disabled?: boolean
}
```

**Layout:**
- Mobile: single column (`grid-cols-1`)
- `sm`+: two columns (`sm:grid-cols-2`)
- Gap: `gap-3`

**Behavior:**
- Tracks the selected value internally; calls `onSelect` on first selection
- After selection, sets `disabled={true}` on all `OptionButton` children
- When the count of options is odd (e.g., 3 or 5 options), the last item spans both columns on desktop: `sm:col-span-2`

**Notes:**
- Single-select only — no multi-select needed for this question set
- `role="group"` with an `aria-label` describing the question for accessibility

---

## 4. General

---

### `Button`

**Purpose:** General-purpose action button. Used for form submission (TextInput send, Slider confirm), the OTP resend link-style action, and other explicit actions.

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
  chat/
    ChatContainer.tsx
    ChatThread.tsx
    ChatBubble.tsx
    TypingIndicator.tsx
    InputArea.tsx
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
  └── ChatContainer
        ├── ChatThread
        │     ├── ChatBubble (role=assistant) × N
        │     ├── TypingIndicator  ← shown while isTyping
        │     └── ChatBubble (role=user) × N
        └── InputArea  ← renders exactly one of:
              ├── TextInput
              ├── PhoneInput
              ├── OTPInput
              ├── DateInput
              ├── Slider
              └── OptionButtonGroup
                    └── OptionButton × N
```

**State flow for a question step:**
1. Parent adds an assistant `ChatBubble` to `messages`
2. `isTyping` is set `true` for ~3s (shows `TypingIndicator`)
3. `isTyping` set `false`, assistant message appears
4. `InputArea` renders the appropriate input below
5. Learner answers → answer value passed to `onSubmit`
6. Parent adds a user `ChatBubble` with the display value of the answer
7. `InputArea` unmounts (or fades out)
8. Loop repeats for the next question
