# Feature Specification: Global Event Handler

**Feature Branch**: `001-global-event-handler`  
**Created**: 2025-02-07  
**Status**: Draft  
**Input**: User description: "글로벌 이벤트 핸들러를 구현하고 싶어"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Subscribe to Global Hotkey Events (Priority: P1)

A developer working on the Tauri desktop app needs a centralized way to listen for application-wide keyboard shortcuts. Instead of scattering `fromEvent(document, 'keydown')` listeners across individual Managers, the developer subscribes to a hotkey event stream from a single source. The stream delivers a rich event object that includes the target element info, so the subscriber can decide whether to act based on context (e.g., ignore when user is typing in an input).

**Why this priority**: This is the foundational capability. Every other feature (React integration, shortcut management) builds on top of the event stream. It replaces the current ad-hoc `fromEvent` pattern in `CommandPaletteManager` with a consistent, centralized approach.

**Independent Test**: Can be fully tested by subscribing to a hotkey combo stream and verifying the subscriber receives an event with correct payload (combo, target element, input context flag) when the corresponding keys are pressed.

**Acceptance Scenarios**:

1. **Given** a subscriber is listening for a specific key combo (e.g., `mod+j`), **When** the user presses that combo anywhere in the app, **Then** the subscriber receives a hotkey event containing the original KeyboardEvent, the target element, and whether the event originated from an input context.
2. **Given** no subscriber is listening for a key combo, **When** the user presses that combo, **Then** no error occurs and the event is silently ignored.
3. **Given** multiple subscribers are listening for the same combo, **When** the combo is pressed, **Then** all subscribers receive the event.
4. **Given** a subscriber unsubscribes from a combo stream, **When** the combo is pressed afterward, **Then** the unsubscribed handler does not fire.
5. **Given** a subscriber wants to ignore input context events, **When** the combo is pressed inside a text input, **Then** the subscriber can filter using the `isInputContext` flag on the event.

---

### User Story 2 - Use Hotkeys in React Components via Context (Priority: P2)

A developer building a React component needs to respond to a global keyboard shortcut. The developer accesses the hotkey system through a React Context (`HotKeyContext`) and uses a `useHotKey` hook to obtain an event stream for a specific combo. The hook returns a stable Observable that the component subscribes to in a `useEffect`. When the component unmounts, the subscription is cleaned up naturally.

**Why this priority**: Most shortcut consumers in this app are React components. Providing a React-idiomatic access pattern (Context + hook) makes the system ergonomic and testable. It depends on the core event stream from P1.

**Independent Test**: Can be tested by rendering a component that uses `useHotKey('mod+k')`, simulating the key combo, and verifying the component's handler is called. Can also test that wrapping with a mock Context allows unit testing without real keyboard events.

**Acceptance Scenarios**:

1. **Given** a React component uses `useHotKey('mod+k')` inside a `HotKeyProvider`, **When** the user presses `Cmd+K`, **Then** the component's subscription handler fires with the hotkey event.
2. **Given** a React component that subscribed to a combo unmounts, **When** the combo is pressed afterward, **Then** the handler does not fire (no memory leak).
3. **Given** a test renders a component with a mock `HotKeyContext`, **When** the test emits a simulated event through the mock, **Then** the component responds without needing real DOM keyboard events.
4. **Given** a component is rendered outside of `HotKeyProvider`, **When** `useHotKey` is called, **Then** a clear error is surfaced (not a silent failure).

---

### User Story 3 - Typed Event Contracts (Priority: P3)

A developer defines a new hotkey combo. The event stream for that combo delivers a well-typed event object. The developer gets full type safety — the event payload shape is defined, and the `isInputContext` flag, `target` element, and `originalEvent` are all correctly typed. No manual type assertions needed.

**Why this priority**: Type safety improves developer experience and prevents runtime bugs, but the system works without it. This is a quality-of-life improvement on top of P1 and P2.

**Independent Test**: Can be tested by subscribing to a typed hotkey stream and verifying that TypeScript catches incorrect property access at compile time.

**Acceptance Scenarios**:

1. **Given** a developer subscribes to a hotkey stream, **When** they access `event.isInputContext`, **Then** it is typed as `boolean` without manual assertion.
2. **Given** a developer subscribes to a hotkey stream, **When** they access `event.target`, **Then** it is typed as `HTMLElement`.
3. **Given** a developer tries to access a non-existent property on the event, **Then** a type error is surfaced at compile time.

---

### Edge Cases

- What happens when an event listener throws an error? Other listeners for the same combo must still receive the event; one failing subscriber must not break the stream.
- What happens when rapid sequential key presses occur (e.g., user holds down a key)? Subscribers must receive all events in order without dropping any.
- What happens when the same combo is subscribed to by many components? The single underlying `fromEvent` listener must be shared efficiently (no duplicate DOM listeners).
- What happens when `useHotKey` is called outside of `HotKeyProvider`? A clear, descriptive error must be thrown immediately.
- What happens when keyboard shortcuts overlap between global hotkey streams and component-local `onKeyDown` handlers? Both fire independently — local handlers via React's event system, global via the hotkey stream. Subscribers decide whether to `preventDefault()`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a subscription-based mechanism where consumers obtain an event stream for a specific key combo and subscribe to it.
- **FR-002**: The event stream MUST deliver a rich event object containing: the original `KeyboardEvent`, the target `HTMLElement`, and an `isInputContext` boolean flag indicating whether the event originated from an input, textarea, or contentEditable element.
- **FR-003**: System MUST allow multiple subscribers to the same key combo, and all subscribers MUST receive the event.
- **FR-004**: Subscribers MUST be able to unsubscribe, ceasing to receive future events. Standard RxJS `subscription.unsubscribe()` MUST work.
- **FR-005**: System MUST NOT filter or suppress events internally based on input context. The `isInputContext` flag is provided for consumers to filter themselves.
- **FR-006**: System MUST isolate subscriber errors — one subscriber throwing an error MUST NOT prevent other subscribers from receiving the event.
- **FR-007**: System MUST provide a React Context (`HotKeyProvider`) that makes the hotkey system available to the component tree.
- **FR-008**: System MUST provide a `useHotKey(combo)` hook that returns a stable Observable for the given combo, usable in `useEffect` subscriptions.
- **FR-009**: `useHotKey` MUST throw a descriptive error when used outside of `HotKeyProvider`.
- **FR-010**: System MUST normalize key combos across platforms — `mod` resolves to `Cmd` on macOS and `Ctrl` on Windows/Linux.
- **FR-011**: Component-local keyboard handlers (e.g., `onKeyDown` on a text input) MUST remain independent and unaffected by the global hotkey system.

### Key Entities

- **HotkeyEvent**: The rich event object delivered to subscribers. Contains the original KeyboardEvent, the target HTMLElement, and the `isInputContext` convenience flag.
- **HotkeyManager**: Singleton that owns the single `document` keydown listener and provides combo-specific Observable streams via an `on(combo)` method. Pure stream provider — no filtering, no handler registration.
- **HotKeyProvider**: React Context provider that makes the HotkeyManager instance available to the component tree. Enables testability via mock injection.
- **useHotKey**: React hook that accesses HotkeyManager from context and returns a stable Observable for a given combo string.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can subscribe to a new global hotkey and have it working in under 5 minutes with no cross-module imports of the Manager.
- **SC-002**: All global keyboard shortcuts are consumed through the hotkey event stream, with zero ad-hoc `fromEvent(document, 'keydown')` listeners remaining in the codebase after migration.
- **SC-003**: A failing subscriber never prevents other subscribers for the same combo from receiving the event (zero cascading failures).
- **SC-004**: React components access the hotkey system exclusively through `useHotKey` hook within `HotKeyProvider` — no direct `HotkeyManager.getInstance()` calls in components.
- **SC-005**: Unit tests for hotkey-consuming components can run with a mock `HotKeyProvider` without real DOM keyboard events.
- **SC-006**: The `isInputContext` flag correctly identifies input, textarea, and contentEditable targets 100% of the time.

## Assumptions

- **Target application**: Tauri desktop app (`apps/tauri`). The web app (`apps/web`) is deprecated and not in scope.
- **Existing patterns**: The HotkeyManager singleton follows the established Singleton + RxJS pattern (e.g., `CommandPaletteManager`, `ChannelState`). React integration follows the Context + hook pattern.
- **Migration**: `CommandPaletteManager`'s existing `fromEvent(document, 'keydown')` for `Cmd+J` will be migrated to use `HotkeyManager.on('mod+j')`.
- **Component-local shortcuts stay local**: Shortcuts like `ArrowUp/Down`, `Enter`, `Escape` in `ChatInputView` remain as local `onKeyDown` handlers — they are context-dependent, not global.
- **Tauri IPC events**: Rust-side Tauri events and OS-level global shortcuts (`@tauri-apps/plugin-global-shortcut`) are out of scope. This focuses on the in-app TypeScript keyboard event layer only.
- **No conflict detection initially**: With fewer than 5 global shortcuts, a `console.warn` for duplicate combo subscriptions is sufficient. Formal conflict detection can be added later if needed.
- **Performance**: Standard desktop app event volumes. A single `fromEvent(document, 'keydown')` listener shared across all combo streams is sufficient.

## Dependencies

- Existing RxJS infrastructure in the Tauri app.
- Existing Singleton Manager pattern (`CommandPaletteManager`, `ChannelState`, etc.) as architectural reference.
- React Context API for component-tree integration.
