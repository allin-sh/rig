# Research: Agent Presets

**Branch**: `002-agent-presets` | **Date**: 2025-02-07

## R1: Mid-Conversation Agent Switching Mechanism

**Decision**: Use `ChatFacade.updateTransport()` to hot-swap provider/model on the existing facade.

**Rationale**: `ChatFacade` already has an `updateTransport(transport, providerName, modelId)` method that re-creates the internal `Chat` instance while preserving existing messages. This means switching agents mid-conversation requires no new plumbing — just create a new `TauriChatTransport` with the new agent's config and call `updateTransport()`. The system prompt change is handled by adding/replacing the system message via `addSystemMessage()`.

**Alternatives considered**:
- Destroying and re-creating the entire `ChatFacade`: Rejected — loses message state, requires re-fetching from storage.
- Creating a separate facade per agent per channel: Rejected — unnecessary complexity, violates YAGNI.

## R2: Agent State Management Pattern

**Decision**: New `AgentPresetState` singleton using `BehaviorSubject`, following the existing `ChannelState` / `ChatInputState` pattern.

**Rationale**: The codebase consistently uses singleton classes with `BehaviorSubject` for state management (`ChannelState`, `ChatInputState`, `SessionMap`, `ChatFacadeManager`, `SlashCommandManager`). A new `AgentPresetState` singleton fits naturally. It holds the combined agent list (UI + file sources) and the active agent index, exposing `activeAgent$` as an observable.

**Alternatives considered**:
- Jotai atoms: Rejected — Tauri app uses RxJS singletons, not Jotai (Jotai is in the deprecated web app only).
- React context: Rejected — state needs to be accessible outside React components (e.g., from `useChat` hook).

## R3: JSON File Loading from Config Directory

**Decision**: Add a new Rust Tauri command `get_file_agents` that reads JSON files from `{app_config_dir}/agents/`.

**Rationale**: The existing `Storage` struct reads from `app_data_dir/storage/`. For user-editable config files, `app_config_dir` (Tauri's `path().app_config_dir()`) is the standard location. A new Rust command reads all `*.json` files from `{app_config_dir}/agents/`, parses them, validates required fields, and returns valid agents. Invalid files are skipped with warnings logged.

**Alternatives considered**:
- Reading from `app_data_dir/storage/file-agents/`: Rejected — config files should be in config dir, not data dir. Users expect to find editable configs in a config location.
- Frontend-side file reading via `@tauri-apps/plugin-fs`: Rejected — keeping file I/O in Rust is consistent with the existing pattern and more robust for validation.
- Watching the directory for changes (hot-reload): Rejected for MVP — spec explicitly states changes are picked up on restart. Can be added later.

## R4: Agent CRUD Frontend Wrappers

**Decision**: Add missing `createAgent`, `updateAgent`, `deleteAgent` wrappers to `tauriStorageClient.ts`.

**Rationale**: The Rust backend already registers `create_agent`, `update_agent`, and `delete_agent` Tauri commands (verified in `lib.rs` and `commands.rs`). The frontend `tauriStorageClient.ts` currently only exposes `getAgent` and `getAllAgents`. Adding the three missing wrappers is trivial — each is a single `invoke()` call matching the existing pattern.

**Alternatives considered**: None — this is straightforward gap-filling.

## R5: UI Surface for Agent Management

**Decision**: Add two new command palette panes: `AgentListView` and `AgentCreateView`, plus a home command entry point.

**Rationale**: The existing command palette uses pane-based routing (`CommandPaneId` union → `ts-pattern` exhaustive matching in `CommandPaletteView`). Adding agent management follows the exact same pattern as providers/model-select. The `HomeCommandView` gets a new "Agents" entry. `AgentListView` shows all agents with source badges (UI vs File), edit/delete for UI agents. `AgentCreateView` is a form reusing the provider/model selection pattern from `ModelSelectView`.

**Alternatives considered**:
- Separate settings page: Rejected — command palette is the established pattern for configuration in this app. A separate page would be inconsistent.
- Inline creation in chat input: Rejected — too cramped for a form with multiple fields.

## R6: Tab Key Conflict Resolution

**Decision**: Tab only triggers agent switching when: (1) chat input textarea is focused, (2) no popover/overlay is active (slash command, etc.), and (3) input is empty or cursor is at position 0.

**Rationale**: The current `handleKeyDown` in `ChatInputView` already has conditional logic for keys (e.g., Enter/ArrowUp/ArrowDown only propagate when `isOpen` is true). Adding Tab follows the same pattern: `if (e.key === 'Tab' && !isOpen) { e.preventDefault(); cycleAgent(); }`. The `isOpen` state already tracks whether the slash command popover is active.

**Alternatives considered**:
- Using a modifier key (Ctrl+Tab, etc.): Rejected — user explicitly chose plain Tab in the spec.
- Only when input is empty: Considered but rejected — spec says Tab always switches when no overlay is active. If user is typing and hits Tab, it still switches (preventing Tab from inserting whitespace is acceptable since chat inputs don't use Tab for indentation).
