<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 1.1.0
  Modified principles:
    - "I. Code Quality" → "II. Code Quality" (renumbered)
    - "II. Testing Standards" → "III. Testing Standards"
      (renumbered)
    - "III. UX Consistency" → "IV. UX Consistency" (renumbered)
    - "IV. Performance Requirements" → "V. Performance
      Requirements" (renumbered)
  Added sections:
    - "I. Clarity & Minimalism" — new top-priority principle
      on clean, concise, readable code with RxJS and design
      patterns
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md — ✅ compatible
      (Constitution Check references constitution generically)
    - .specify/templates/spec-template.md — ✅ compatible
      (Success Criteria section is generic)
    - .specify/templates/tasks-template.md — ✅ compatible
      (Task structure unchanged)
    - .specify/templates/checklist-template.md — ✅ compatible
      (Generic template)
    - .specify/templates/agent-file-template.md — ✅ compatible
      (Code Style auto-generated from plans)
  Follow-up TODOs: None
-->

# ALLIN Constitution

## Core Principles

### I. Clarity & Minimalism

Code MUST be concise, readable, and free of unnecessary
complexity. This is the highest-priority principle — every
line of code earns its place or gets removed.

- **No verbosity**: Eliminate boilerplate, redundant wrappers,
  and over-abstracted indirection. If a concept can be
  expressed in fewer lines without sacrificing clarity, the
  shorter form is mandatory.
- **Simple over clever**: Code MUST be immediately
  understandable by a reader unfamiliar with the module.
  Clever one-liners that obscure intent are forbidden.
  Straightforward idioms always win.
- **Minimal surface area**: Modules MUST expose only what
  consumers need. No public helpers "just in case." Internal
  details stay internal.
- **Leverage RxJS idiomatically**: Use RxJS operators
  (`map`, `filter`, `switchMap`, `combineLatest`,
  `distinctUntilChanged`, etc.) to express data flows
  declaratively. Prefer a single composed pipeline over
  imperative `if/else` chains, nested callbacks, or
  manual state tracking. Let the stream do the work.
- **Leverage design patterns**: Apply established patterns
  (Singleton, Observer via `Subject`, Strategy, Registry)
  when they reduce code volume and clarify intent. Never
  introduce a pattern for its own sake — the result MUST
  be shorter or clearer than the pattern-free alternative.
- **One responsibility, one place**: Duplicated logic MUST
  be extracted. But extraction MUST make the code shorter
  overall, not longer. If a helper adds more lines than it
  saves, inline is better.
- **Naming as documentation**: Well-chosen names replace
  comments. If a variable or function needs a comment to
  explain *what* it does, rename it instead.

*Rationale*: Concise code is easier to review, easier to
debug, and less likely to harbor hidden bugs. RxJS and
design patterns are tools for compression — they let you
say more with less, but only when applied judiciously.

### II. Code Quality

Every module MUST meet the following non-negotiable standards:

- **TypeScript strict mode** is mandatory across all packages.
  No `any`, `unknown`, `@ts-ignore`, or `@ts-expect-error`
  usage. If a type is unclear, ask — do not suppress.
- **Biome** is the sole formatter and linter. All code MUST
  pass `pnpm lint:fix` and `pnpm check-ts` with zero errors
  before merge.
- **View / State separation**: React components handle
  rendering only. State logic lives in dedicated Singleton
  classes using RxJS `BehaviorSubject`. Files follow
  `*View.tsx` / `*State.ts` / `*Manager.ts` naming.
- **Exhaustive pattern matching**: All union type branching
  MUST use `ts-pattern` with `.exhaustive()`. No `if/else`
  chains or `switch` fallthrough on discriminated unions.
- **Import discipline**: External libraries → `@allin/*`
  packages → relative imports. Use `type` imports for
  type-only references.
- **YAGNI**: Implement only what is requested. No premature
  abstraction, no speculative features. Mark future work
  with `TODO` comments.
- **Error handling**: Never swallow errors silently. Use
  specific error types. User-facing errors MUST surface via
  toast notifications with clear messages.

*Rationale*: Consistent, type-safe code reduces defect
density, makes reviews faster, and keeps the monorepo
coherent as it grows.

### III. Testing Standards

All features MUST be verifiable through automated tests:

- **Framework**: Vitest is the sole test runner. Test files
  MUST use `*.test.ts` or `*.test.tsx` extensions.
- **Placement**: Tests reside next to their source files or
  in a colocated `test/` directory within the same package.
- **Coverage expectations**: Every new public function,
  service method, and state class MUST have at least one
  corresponding test covering the happy path. Edge cases
  MUST be tested for any function that handles user input
  or external data.
- **Test isolation**: Each test MUST be independent — no
  shared mutable state between test cases. Use `beforeEach`
  for setup, not module-level side effects.
- **Naming**: Test descriptions MUST state the expected
  behavior in plain English:
  `it('returns empty array when no sessions exist')`,
  not `it('works')`.
- **Regression rule**: Every confirmed bug fix MUST include
  a test that reproduces the bug before the fix is applied.
- **Build gate**: `pnpm test:once` MUST pass with zero
  failures before any PR is merged.

*Rationale*: Automated tests are the primary defense against
regressions in a monorepo where package changes ripple
across multiple consumers.

### IV. UX Consistency

User-facing behavior MUST be predictable and uniform:

- **Component library**: All UI MUST use components from
  `@allin/ui` or `src/components`. Ad-hoc HTML elements
  with inline styles are forbidden for interactive controls.
- **Styling**: Tailwind CSS is the sole styling approach.
  No CSS modules, styled-components, or inline `style`
  props except for truly dynamic values (e.g., computed
  positions).
- **Icons**: Use only `lucide-react` or `@lobehub/icons`.
  Do not introduce additional icon libraries without
  justification.
- **Conditional rendering**: Prefer mount/unmount pattern
  (`{isOpen && <Component />}`) over open/close props.
  Parent controls existence; child is always "active."
- **Centralized routing**: Multi-pane UIs MUST route from
  a single root component using `ts-pattern` matching. No
  distributed `if (currentPane === X)` checks in children.
- **Keyboard and accessibility**: Interactive elements MUST
  be keyboard-navigable. Command palette interactions MUST
  follow `cmdk` conventions.
- **Error feedback**: User-facing errors MUST display via
  toast (`top-center`, 15s duration). Never fail silently
  from the user's perspective.

*Rationale*: A consistent interface reduces cognitive load
for users and maintenance burden for developers. Uniform
patterns make the app feel cohesive rather than stitched
together.

### V. Performance Requirements

The application MUST remain responsive under normal usage:

- **Initial load**: Web app first contentful paint MUST be
  under 2 seconds on a standard broadband connection. Tauri
  app window MUST appear within 1.5 seconds of launch.
- **Interaction latency**: UI responses to user input
  (clicks, keystrokes, navigation) MUST complete within
  100ms. Operations exceeding 200ms MUST show a loading
  indicator.
- **Streaming**: AI chat responses MUST begin streaming to
  the user within 500ms of the provider's first token
  arrival. No buffering entire responses before display.
- **Memory**: The app MUST NOT exhibit unbounded memory
  growth during a session. RxJS subscriptions MUST be
  unsubscribed on component unmount. BehaviorSubjects MUST
  be completed when their owner is destroyed.
- **Bundle size**: New dependencies MUST be evaluated for
  bundle impact. Dependencies adding >50KB gzipped MUST be
  justified and approved before introduction.
- **Re-render discipline**: React components MUST NOT
  re-render on every observable emission. Use
  `distinctUntilChanged`, selector functions, and
  memoization to prevent unnecessary renders.
- **IndexedDB operations**: Database reads/writes MUST be
  non-blocking. Bulk operations MUST be batched. No
  synchronous data access patterns on the main thread.

*Rationale*: Performance is a feature. Users expect
desktop-class responsiveness from an AI tool they use
frequently. Degraded performance erodes trust and adoption.

## Development Workflow

The following workflow applies to all code changes:

1. **Branch from main**: Every feature or fix starts on a
   dedicated branch named `{issue-number}-{feature-name}`.
2. **Implement with tests**: Write or update tests alongside
   implementation. Tests MUST fail before the fix/feature is
   applied (red-green cycle encouraged but not enforced as
   mandatory TDD).
3. **Self-check before PR**:
   - `pnpm check-ts` — zero errors
   - `pnpm lint:fix` — zero warnings
   - `pnpm test:once` — all tests pass
   - `pnpm build` — successful build
4. **PR review**: All changes MUST be reviewed. Reviewer
   MUST verify compliance with this constitution's
   principles.
5. **Merge**: Squash-merge to main. Commit message follows
   conventional commits (`feat:`, `fix:`, `refactor:`,
   `docs:`).

## Quality Gates

Every PR MUST pass these gates before merge:

| Gate | Command | Criteria |
|------|---------|----------|
| Type Safety | `pnpm check-ts` | Zero errors |
| Lint | `pnpm lint:fix` | Zero warnings |
| Tests | `pnpm test:once` | All pass, no skipped |
| Build | `pnpm build` | Exit code 0 |

A PR that fails any gate MUST NOT be merged regardless of
review approval.

## Governance

This constitution is the authoritative source of project
standards. In case of conflict between this document and any
other guide (including AGENTS.md), this constitution prevails.

- **Amendments**: Any change to this constitution MUST be
  documented with a version bump, rationale, and migration
  plan for affected code.
- **Versioning**: This document follows semantic versioning:
  - MAJOR: Principle removed or fundamentally redefined
  - MINOR: New principle or materially expanded guidance
    added
  - PATCH: Wording clarifications, typo fixes
- **Compliance review**: PR reviewers MUST verify that
  changes comply with all five principles. Non-compliance
  MUST be flagged as a blocking review comment.
- **Runtime guidance**: See `AGENTS.md` for detailed coding
  conventions, patterns, and library-specific guidance that
  operationalize these principles.

**Version**: 1.1.0 | **Ratified**: 2026-02-07 | **Last Amended**: 2026-02-07
