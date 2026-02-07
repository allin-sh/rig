# Implementation Plan: Global Event Handler

**Branch**: `001-global-event-handler` | **Date**: 2025-02-07 | **Spec**: [spec.md](./spec.md)

## Summary

Centralized keyboard shortcut system for the Tauri desktop app. A `HotkeyManager` singleton provides subscription-based event streams (`on(combo) → Observable<HotkeyEvent>`) for any key combination. Events include target element info (`isInputContext`) so consumers decide whether to act. React components access it through `HotKeyProvider` context and `useHotKey` hook. Migrates `CommandPaletteManager`'s ad-hoc `Cmd+J` listener to the new system.

## Technical Context

**Language/Version**: TypeScript (strict mode) + React 19  
**Primary Dependencies**: RxJS 7, React Context API  
**Storage**: N/A  
**Testing**: Vitest 3.2 + @testing-library/react 16 + jsdom  
**Target Platform**: Tauri desktop app (macOS, Windows, Linux)  
**Project Type**: Monorepo (Turbo + pnpm) — changes in `apps/tauri` only  
**Performance Goals**: Single DOM keydown listener shared across all combos. <1ms per event dispatch.  
**Constraints**: Zero new dependencies. No re-renders from hotkey events (Observable-based, not state-based).  
**Scale/Scope**: <5 global shortcuts initially. One Manager, one Provider, one hook.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --------- | ------ | ----- |
| **I. Clarity & Minimalism** | PASS | ~40 lines of Manager logic. RxJS idiomatic (`fromEvent` + `share` + `filter` + `map`). Singleton pattern. Minimal surface area (`on()` is the only public method). |
| **II. Code Quality** | PASS | TypeScript strict, no `any`. View/State separation (Manager = state, Provider/hook = view bridge). `*Manager.ts` naming. YAGNI — no conflict detection, no persistence, no shortcut registry UI. |
| **III. Testing Standards** | PASS | Vitest. Co-located test files. Manager tested with direct Observable assertions. Component tests use mock Provider injection. |
| **IV. UX Consistency** | PASS | Centralizes keyboard shortcuts. Input suppression via `isInputContext` flag. Does not break existing `cmdk` command palette. |
| **V. Performance** | PASS | Single `fromEvent(document, 'keydown')` with `share()`. No React state updates from events — Observable subscription only. No new dependencies (0 KB added). |

**Post-Phase 1 re-check**: PASS. No violations introduced by design artifacts.

## Project Structure

### Documentation (this feature)

```text
specs/001-global-event-handler/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── hotkey-api.ts
├── checklists/
│   └── requirements.md
└── tasks.md             (created by /speckit.tasks)
```

### Source Code

```text
apps/tauri/src/business/hotkey/
├── types.ts                # HotkeyEvent type definition
├── HotkeyManager.ts        # Singleton — fromEvent + share + on(combo)
├── HotkeyProvider.tsx       # React Context + Provider
├── useHotKey.ts             # Hook — context access + memoized Observable
└── HotkeyManager.test.ts   # Unit tests for Manager

apps/tauri/src/app/
└── page.tsx                 # (MODIFIED) Wrap with HotKeyProvider

apps/tauri/src/business/command-palette/
└── CommandPaletteManager.ts # (MODIFIED) Migrate fromEvent → HotkeyManager.on()
```

**Structure Decision**: Feature-based folder under `business/hotkey/`, consistent with existing modules (`command-palette/`, `slash-command/`, `chatting/`). Types co-located per module convention. Tests co-located with source.

## Complexity Tracking

No constitution violations. No complexity justification needed.
