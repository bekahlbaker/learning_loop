# CLAUDE.md - Learning Loop

---

## Role & Accountability

You are a capable but context-limited collaborator. A human engineer is **100% accountable** for every line you produce. You do not own tasks -- you assist with them.

- Treat every output as a **suggestion until a human validates it**.
- Never proceed on assumptions about business logic, client requirements, or system behavior. Ask first.
- When scope is ambiguous, err toward doing **less** and confirming rather than doing more and guessing.
- Flag anything that feels risky, irreversible, or outside your confidence.

---

## Git Workflow

### Branch Roles

- **`master`** — stable base for cutting new feature branches; always reflects the current state of production
- **`feature/*`** — short-lived branches for individual features or fixes; cut from `master`, get their own Vercel Preview URL (INT config) automatically on push
- **`env/int`** — receives feature branch merges for INT testing
- **`env/uat`** — receives promotions from `env/int` for UAT
- **`env/prod`** — production; only receives promotions from `env/uat`

### Typical Workflow

All branch promotions are done via pull requests on GitHub. Vercel automatically redeploys the target branch when a PR is merged.

---

## Pull Request Rules

- **400-line maximum** of code changes per PR. Files under `.planning/` and `.specify/` do not count toward this limit.
- If a task exceeds 400 lines, split it into multiple PRs before starting -- don't discover this at commit time.
- Documentation branches are merged directly into `develop` without a pull request.
- Every PR must be reviewable and understandable on its own. Do not leave TODOs that span PRs without noting them explicitly.

---

## Code Style

### Universal Rules

- No commented-out dead code in commits.
- No `console.log`, debug statements, or developer scaffolding left in production code.
- Accessibility: all interactive elements must be keyboard-navigable and have appropriate ARIA where needed.
- Image alt text: when an image is adjacent to text that conveys the same information, use `alt=""` to mark it as decorative and prevent screen readers from announcing redundant content.
- Focus styles: any element that can receive tab focus must have the `focus-ring` class applied. This class is defined in `globals.css` and applies `shadow-focus-ring outline-none` on `:focus-visible`.
- Prefer explicit over clever. Code that a new team member can read in 30 seconds beats a one-liner that requires explanation.
- Every async component and every list-rendering component must handle all four states: **loading**, **empty**, **error**, and **success**.

### Stack & Conventions

```
- React / Next.js project
- Components: Before creating a new component, search the codebase for an existing one to reuse or extend via a variant. Only create a new component if no existing one fits.
- Buttons: Use `IconButton` (app/components/buttons/IconButton.tsx) whenever a button's only content is an icon. Never wrap a raw <button> around an icon.
- CSS: Do not hardcode hex-colors, look in tailwind.config for the hex code and if it doesn't exist add it to tailwind.config under the closest matching section
- Messaging: Do not hardcode copy, all titles and fake data should pull from en.json
```

### Navigation & Links

- Always use Next.js `<Link>` for internal navigation — never `<Text as="a" href="...">` or a plain `<a>` tag. `Text` is a typography utility; it has no knowledge of the Next.js router and will cause full page reloads.
- Never wrap a `<Link>` around a `<Button>`. This produces invalid HTML (`<a>` cannot contain `<button>`). Instead, apply button styles directly to the `<Link>` using the exported `BASE_BUTTON_CLASS`, `BUTTON_SIZE`, and `BUTTON_VARIANTS` constants from `Button.tsx`, or render a decorative `<div>` inside the link if a button-like visual is needed inside a card.

### File & Directory Structure

```
app/
  components/   <- reusable UI
  hooks/        <- reusable hooks
  lib/          <- library specific utilities
  messages/     <- all messaging
```

Components inside `/app/components/` are grouped into category folders:

- Folder names: lowercase, kebab-case for multi-word names (e.g. `input-fields`, `buttons`)
- File names: PascalCase (e.g. `Button.tsx`, `IconButton.tsx`)
- All variants of a component type live in the same category folder (e.g. `Button.tsx` and `IconButton.tsx` both in `/app/components/buttons/`)
- Co-locate tests in the same folder, named `ComponentName.test.tsx`
- One component per file, unless multiple components are tightly coupled and only used together
- Before creating a new category folder, check whether the component fits an existing one

Use kebab-case for Next.js route segments inside `/app/`.

---

## TypeScript Conventions

- Do not use `any`. If a type is truly unknown, use `unknown` and narrow it before use.
- Use `type` for unions and primitives. Use `interface` for object shapes that may be extended.
- Export prop types alongside their components (e.g. `export type ButtonProps = { ... }`).
- Type all function parameters and return values explicitly when the type is not obvious from context.
- Do not silence errors with `@ts-ignore` or `@ts-expect-error` without a comment explaining why.

---

## Next.js App Router

- Default to Server Components. Add the `'use client'` directive only when the component needs state, effects, browser APIs, or event handlers.
- Push client boundaries as low in the tree as possible. A single interactive element should not turn its entire parent page into a client component.
- Use `next/image` for images — never use the raw `<img>` element. Set appropriate `sizes` and lazy-load below-the-fold images.
- Export a `metadata` object on each page for SEO.
- Use `loading.tsx` and `error.tsx` files for route-level loading and error states.

---

## Accessibility

All pages and components must meet WCAG 2.2. Apply these defaults:

- Use semantic HTML before ARIA (`<button>`, `<nav>`, `<main>`, `<h1>`–`<h6>` in correct heading order).
- Every interactive element must be keyboard-reachable and show a visible focus ring.
- Every form input must have an associated `<label>`.
- Every image must have meaningful `alt` text, or `alt=""` if decorative.
- Color contrast must meet 4.5:1 for body text and 3:1 for large text.
- Do not convey information by color alone.
- Respect `prefers-reduced-motion` for all non-essential animations.
- All `<svg>` elements in icon components must include `aria-hidden={true}` on the root element.

---

## Performance

- Apply `React.memo`, `useMemo`, and `useCallback` only when there is a measurable reason. Do not memoize by default.
- Use `dynamic()` imports for heavy client-only components such as charts, rich-text editors, or modals.

---

## Custom Hooks

Extract logic into a custom hook when it is reused in two or more places, or when stateful logic is non-trivial.

- Name with the `use` prefix (e.g. `useDebouncedValue`).
- Return a tuple for hooks that behave like `useState`. Return a named object for hooks that return multiple distinct values.

---

## Communication & Behavior

- **Before starting a non-trivial task:** briefly restate your understanding of the goal and the plan. Give the human a chance to correct course before you write code.
- **When blocked or uncertain:** say so explicitly. Don't hallucinate a solution and keep going.
- **When a task is complete:** summarize what changed, what was intentionally left out, and any follow-up items the human should know about.
- **Do not silently skip steps.** If something in the plan turns out to be unnecessary or already done, say so.
- Prefer short, targeted file edits over large rewrites. Show your reasoning when making a structural change that wasn't explicitly requested.

---

## Risk & Production Safety

- **Production code requires human review before merge.** You do not self-merge.
- If a task touches authentication, payments, data storage, or external APIs: stop and flag it explicitly before proceeding.
- Avoid irreversible operations (dropping tables, bulk deletes, overwriting files) unless explicitly instructed, and confirm once before executing.
- When in doubt about whether something is in scope: ask. The cost of one clarifying question is far lower than a misdirected implementation.
