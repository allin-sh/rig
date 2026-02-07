# Data Model: Global Event Handler

**Branch**: `001-global-event-handler` | **Date**: 2025-02-07

## Entities

### HotkeyEvent

The rich event object delivered to all subscribers when a matching key combo fires.

| Field | Type | Description |
| ----- | ---- | ----------- |
| `originalEvent` | `KeyboardEvent` | The raw browser keyboard event. Subscribers can call `preventDefault()` on it. |
| `target` | `HTMLElement` | The DOM element that had focus when the key was pressed. |
| `isInputContext` | `boolean` | `true` if target is `<input>`, `<textarea>`, or `contentEditable` element. Convenience flag for consumers to filter. |

**No persistence** — this is an ephemeral event, not stored.

---

### HotkeyManager (Singleton)

The centralized event stream provider. Owns the single `document` keydown listener and exposes per-combo Observable streams.

| Internal State | Type | Description |
| -------------- | ---- | ----------- |
| `keydown$` | `Observable<KeyboardEvent>` | Shared (multicasted) stream from `fromEvent(document, 'keydown')`. Created once in constructor. |
| `isMac` | `boolean` | Platform detection result. `true` on macOS, `false` on Windows/Linux. Determines how `mod` resolves. |

**Methods**:

| Method | Signature | Description |
| ------ | --------- | ----------- |
| `getInstance()` | `static getInstance(): HotkeyManager` | Standard singleton accessor. |
| `on(combo)` | `on(combo: string): Observable<HotkeyEvent>` | Returns a filtered Observable that emits `HotkeyEvent` only when the specified combo is pressed. |

**No registry, no Map, no stored handlers** — the Manager is a pure stream provider. Each `on()` call creates a new filtered view of the shared `keydown$` stream.

---

### HotKeyProvider (React Context)

React Context provider that makes a `HotkeyManager` instance available to the component tree.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `children` | `ReactNode` | Child component tree. |
| `manager?` | `HotkeyManager` | Optional override for testing. Defaults to `HotkeyManager.getInstance()`. |

---

### useHotKey (React Hook)

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `combo` | `string` | Key combination string (e.g., `'mod+j'`, `'mod+shift+p'`). |
| **Returns** | `Observable<HotkeyEvent>` | Stable Observable (memoized by combo string). Consumer subscribes in `useEffect`. |

---

## Combo String Format

Key combos are normalized strings with modifiers in a fixed order: `mod`, `shift`, `alt`, then the key.

| Combo String | Keys Pressed (macOS) | Keys Pressed (Windows/Linux) |
| ------------ | -------------------- | ---------------------------- |
| `mod+j` | Cmd+J | Ctrl+J |
| `mod+shift+p` | Cmd+Shift+P | Ctrl+Shift+P |
| `mod+enter` | Cmd+Enter | Ctrl+Enter |
| `shift+alt+n` | Shift+Option+N | Shift+Alt+N |
| `escape` | Escape | Escape |

**Normalization rule**: `normalizeCombo(e: KeyboardEvent) → string`
- If `metaKey` (mac) or `ctrlKey` (non-mac) → prepend `mod+`
- If `shiftKey` → prepend `shift+`
- If `altKey` → prepend `alt+`
- Append `e.key.toLowerCase()`
- Join with `+`

## State Transitions

None — there is no stored state. The Manager is stateless. Events flow through and are discarded.

## Relationships

```
HotkeyManager (singleton)
    │
    ├── on('mod+j') ──→ Observable<HotkeyEvent> ──→ CommandPaletteManager (subscriber)
    ├── on('mod+k') ──→ Observable<HotkeyEvent> ──→ Any future feature (subscriber)
    └── ...
    
HotKeyProvider (React Context)
    │
    └── useHotKey('mod+j') ──→ Observable<HotkeyEvent> ──→ React component (subscriber)
```
