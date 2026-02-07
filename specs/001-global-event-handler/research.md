# Research: Global Event Handler

**Branch**: `001-global-event-handler` | **Date**: 2025-02-07

## R1: React Context vs Direct Singleton Access

**Context**: The spec requires `HotKeyProvider` + `useHotKey` hook (React Context pattern). However, the existing codebase uses **no React Contexts** for Manager access — all Managers are accessed directly via `getInstance()` in hooks (e.g., `useCommandPalette` calls `CommandPaletteManager.getInstance()`). The only Context is `QueryProvider` for TanStack Query.

**Decision**: Introduce `HotKeyContext` as a new pattern.

**Rationale**:
- The user explicitly requested this for testability (mock injection without real DOM events).
- It's a genuine improvement: existing Manager tests can't easily mock the singleton in component tests.
- The pattern is additive — it doesn't break existing conventions, it extends them.
- `QueryProvider` already establishes precedent for React Context in the app.

**Alternatives considered**:
- **Direct `getInstance()` in hook** (existing pattern): Simpler but prevents mock injection in tests. Component tests would need real keyboard events or global singleton patching.
- **Dependency injection via constructor**: Over-engineered for this use case.

---

## R2: Sharing a Single `fromEvent` Listener

**Context**: FR-003 requires multiple subscribers for the same combo. FR edge case says "no duplicate DOM listeners." Need to ensure one `fromEvent(document, 'keydown')` is shared across all `on(combo)` calls.

**Decision**: Use RxJS `share()` on the base `fromEvent` stream.

**Rationale**:
- `fromEvent` creates a new `addEventListener` per subscription by default.
- `share()` multicasts: one DOM listener, many subscribers.
- `on(combo)` returns a filtered view of the shared stream — each call doesn't add a new DOM listener.

**Alternatives considered**:
- **`shareReplay(1)`**: Unnecessary — hotkey events are ephemeral, no need to replay the last event to late subscribers.
- **Manual `addEventListener` with `Subject.next()`**: More code, same result. `fromEvent` + `share()` is idiomatic RxJS.

---

## R3: Subscriber Error Isolation

**Context**: FR-006 requires that one subscriber throwing an error must not break other subscribers. By default, RxJS terminates a stream on error.

**Decision**: The `on(combo)` method returns a new filtered Observable per call. Each subscriber has its own subscription pipeline. One subscriber's error does not affect others because they are separate subscriptions to the shared source.

**Rationale**:
- RxJS `share()` does NOT propagate subscriber errors upstream — an error in one `subscribe()` callback doesn't affect the shared source or other subscribers.
- No additional error handling infrastructure needed. The standard RxJS subscription model already provides isolation.
- If a subscriber wants error handling, they add `catchError` in their own `.pipe()`.

**Alternatives considered**:
- **Wrapping each subscriber callback in try/catch inside the Manager**: Violates "Manager = Pure Registry" — error handling belongs to consumers.
- **Custom Subject with error swallowing**: Unnecessary complexity given RxJS already handles this.

---

## R4: Platform Detection for `mod` Key

**Context**: FR-010 requires `mod` to resolve to `Cmd` (metaKey) on macOS and `Ctrl` (ctrlKey) on Windows/Linux.

**Decision**: Check `navigator.platform` at Manager construction time. Cache the result. Use it in `normalizeCombo()`.

**Rationale**:
- `navigator.platform` is available in both browser and Tauri webview contexts.
- One-time check at construction — no per-event overhead.
- Tauri runs on macOS, Windows, and Linux — all three need correct mod key mapping.

**Alternatives considered**:
- **`navigator.userAgentData.platform`**: Newer API but not universally supported in all Tauri webview versions.
- **Always check both `metaKey` and `ctrlKey`**: Ambiguous — on macOS, Ctrl+J and Cmd+J are different shortcuts. Must distinguish them.

---

## R5: `useHotKey` Return Type — Observable vs Callback

**Context**: The spec says `useHotKey(combo)` returns a stable Observable. But there's also a pattern where the hook takes a callback and manages the subscription lifecycle internally.

**Decision**: Return a stable `Observable<HotkeyEvent>`. Consumer subscribes in `useEffect`.

**Rationale**:
- Consistent with the existing RxJS-centric architecture. Developers already work with Observables.
- Composable — consumers can `.pipe(filter, debounce, map, ...)` before subscribing.
- The user explicitly requested "이벤트 스트림을 가져오는거야" (get the event stream).

**Alternatives considered**:
- **Callback-based `useHotKey(combo, callback)`**: More React-idiomatic but hides the Observable, preventing composition. Breaks the RxJS-first philosophy.
- **Both (overloaded API)**: Violates YAGNI and increases surface area.

---

## R6: Where to Wrap `HotKeyProvider`

**Context**: The app root is `apps/tauri/src/app/page.tsx`, which already wraps `QueryProvider`. Need to determine where `HotKeyProvider` goes.

**Decision**: Wrap at the root `page.tsx`, inside `QueryProvider` (order doesn't matter — they're independent). HotkeyManager is instantiated once when the Provider mounts.

**Rationale**:
- Consistent with existing provider wrapping pattern in `page.tsx`.
- All components in the tree get access to the hotkey system.
- Manager lifecycle matches app lifecycle (created once, never destroyed).

**Alternatives considered**:
- **Wrap in `layout.tsx`**: Layout is a Server Component by default. Providers need `'use client'`. `page.tsx` already has this.
- **Lazy initialization without Provider**: Works but prevents mock injection in tests, which is the whole point of the Context.
