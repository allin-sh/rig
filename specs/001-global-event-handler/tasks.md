# Tasks: Global Event Handler

**Input**: Design documents from `/specs/001-global-event-handler/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/hotkey-api.ts, quickstart.md

**Tests**: Included — constitution (III. Testing Standards) requires tests for every new public function and state class.

**Organization**: Tasks grouped by user story. US3 (Typed Event Contracts) is embedded in US1 since `types.ts` is created as part of the foundational type definitions.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in all descriptions

## Phase 1: Setup

**Purpose**: Create directory structure and shared type definitions

- [x] T001 Create directory `apps/tauri/src/business/hotkey/`
- [x] T002 Create `HotkeyEvent` type and `IHotkeyManager` interface in `apps/tauri/src/business/hotkey/types.ts` per contracts/hotkey-api.ts — includes `originalEvent: KeyboardEvent`, `target: HTMLElement`, `isInputContext: boolean`

**Checkpoint**: Directory exists, types compile with `pnpm check-ts`

---

## Phase 2: User Story 1 — Subscribe to Global Hotkey Events (Priority: P1) MVP

**Goal**: HotkeyManager singleton with `on(combo)` → `Observable<HotkeyEvent>`. Single shared `fromEvent(document, 'keydown')` listener. Platform-aware `mod` key normalization. No filtering — consumers decide via `isInputContext`.

**Independent Test**: Subscribe to `on('mod+j')`, simulate keydown, verify HotkeyEvent received with correct `target`, `isInputContext`, `originalEvent`.

### Tests for User Story 1

- [x] T003 [US1] Write tests for HotkeyManager in `apps/tauri/src/business/hotkey/HotkeyManager.test.ts`:
  - `on(combo)` emits HotkeyEvent when matching combo is pressed
  - `on(combo)` does NOT emit for non-matching combos
  - `isInputContext` is `true` when target is `<input>`, `<textarea>`, or `contentEditable`
  - `isInputContext` is `false` when target is `<div>` or `<body>`
  - Multiple subscribers to same combo all receive the event
  - Unsubscribed listener does not receive events
  - `normalizeCombo` produces correct strings: `mod+j`, `mod+shift+p`, `escape`
  - Platform detection: `mod` maps to `metaKey` on mac, `ctrlKey` on others

### Implementation for User Story 1

- [x] T004 [US1] Implement `normalizeCombo(e: KeyboardEvent): string` helper and `isMac` platform detection in `apps/tauri/src/business/hotkey/HotkeyManager.ts` — modifier order: `mod+shift+alt+key`, key lowercased (see data-model.md Combo String Format)
- [x] T005 [US1] Implement `HotkeyManager` singleton in `apps/tauri/src/business/hotkey/HotkeyManager.ts` — private constructor creates `fromEvent<KeyboardEvent>(document, 'keydown').pipe(share())`, `on(combo)` returns filtered+mapped Observable per data-model.md
- [x] T006 [US1] Export singleton instance `export const hotkeyManager = HotkeyManager.getInstance()` at bottom of `apps/tauri/src/business/hotkey/HotkeyManager.ts`
- [x] T007 [US1] Verify tests pass: run `pnpm vitest run apps/tauri/src/business/hotkey/HotkeyManager.test.ts`

**Checkpoint**: HotkeyManager works standalone. `on('mod+j')` emits correctly. All tests green. `pnpm check-ts` clean.

---

## Phase 3: User Story 2 — Use Hotkeys in React Components via Context (Priority: P2)

**Goal**: `HotKeyProvider` React Context + `useHotKey(combo)` hook. Provider accepts optional `manager` prop for test mock injection. Hook returns stable (memoized) Observable. Throws when used outside Provider.

**Independent Test**: Render component inside `HotKeyProvider`, call `useHotKey('mod+k')`, verify Observable is returned. Render without Provider, verify error thrown.

### Tests for User Story 2

- [x] T008 [US2] Write tests for useHotKey hook in `apps/tauri/src/business/hotkey/useHotKey.test.tsx`:
  - Returns Observable when used inside HotKeyProvider
  - Throws descriptive error when used outside HotKeyProvider
  - Returned Observable is stable across re-renders (same reference for same combo)
  - Mock manager can be injected via Provider `manager` prop
  - Mock manager's `on()` is called with the correct combo string

### Implementation for User Story 2

- [x] T009 [P] [US2] Implement `HotKeyProvider` with `HotKeyContext` in `apps/tauri/src/business/hotkey/HotkeyProvider.tsx` — createContext with `null` default, Provider accepts optional `manager` prop (defaults to `HotkeyManager.getInstance()`), exports `HotKeyProvider` component
- [x] T010 [P] [US2] Implement `useHotKey(combo: string)` hook in `apps/tauri/src/business/hotkey/useHotKey.ts` — reads manager from context, throws if null, returns `useMemo(() => manager.on(combo), [manager, combo])`
- [x] T011 [US2] Wrap root app with `HotKeyProvider` in `apps/tauri/src/app/page.tsx` — add `<HotKeyProvider>` inside `<QueryProvider>`, wrapping existing children
- [x] T012 [US2] Verify tests pass: run `pnpm vitest run apps/tauri/src/business/hotkey/useHotKey.test.tsx`

**Checkpoint**: useHotKey works in components. Provider wraps app root. Mock injection works. All tests green. `pnpm check-ts` clean.

---

## Phase 4: Migration & Polish

**Purpose**: Migrate existing ad-hoc shortcuts to the new system. Validate end-to-end.

- [x] T013 Migrate `CommandPaletteManager` in `apps/tauri/src/business/command-palette/CommandPaletteManager.ts`:
  - Remove `setupKeyboardShortcut()` method and `isKeyboardShortcutSetup` flag
  - Remove `fromEvent` import (if no longer used)
  - In constructor, subscribe to `HotkeyManager.getInstance().on('mod+j')` with existing filter logic (`!isInputContext`, pane is null)
  - Import `HotkeyManager` from `@/business/hotkey/HotkeyManager`
- [x] T014 Verify existing `Cmd+J` behavior still works: run `pnpm check-ts` and `pnpm test:once` from repo root
- [x] T015 Run full quality gates: `pnpm check-ts && pnpm lint:fix && pnpm test:once && pnpm build` from repo root

**Checkpoint**: Zero ad-hoc `fromEvent(document, 'keydown')` listeners remaining. All quality gates pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 (types.ts must exist)
- **Phase 3 (US2)**: Depends on Phase 2 (HotkeyManager must exist)
- **Phase 4 (Migration)**: Depends on Phase 2 + Phase 3 (Manager + Provider must both be in place)

### User Story Dependencies

- **US1 (P1)**: Independent — foundational layer
- **US2 (P2)**: Depends on US1 (needs HotkeyManager for Provider to wrap)
- **US3 (P3)**: Embedded in US1 — types.ts created in T002, type safety verified by all tests

### Within Each Phase

- Tests written FIRST (T003 before T004-T006, T008 before T009-T011)
- Types before implementation
- Manager before Provider/hook
- Implementation before migration

### Parallel Opportunities

```bash
# Phase 3: T009 and T010 can run in parallel (different files)
Task T009: "HotkeyProvider in HotkeyProvider.tsx"
Task T010: "useHotKey in useHotKey.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: User Story 1 (T003-T007)
3. **STOP and VALIDATE**: HotkeyManager works, tests pass, types compile
4. Can already be used by Managers outside React (e.g., CommandPaletteManager)

### Incremental Delivery

1. Phase 1 + Phase 2 → HotkeyManager usable standalone (MVP)
2. Phase 3 → React integration via Context + hook
3. Phase 4 → Migration of existing shortcuts + full validation

---

## Notes

- Zero new dependencies — only RxJS (already installed) and React Context API (built-in)
- US3 (Typed Event Contracts) is NOT a separate phase — type safety is built into T002 (types.ts) and verified by all tests
- Component-local shortcuts (`ArrowUp/Down`, `Enter`, `Escape` in ChatInputView) are NOT migrated — they stay as local `onKeyDown` handlers per spec assumptions
- Total: 15 tasks, 3 phases of user story work + 1 migration phase
