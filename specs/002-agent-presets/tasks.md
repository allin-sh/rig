# Tasks: Agent Presets

**Input**: Design documents from `/specs/002-agent-presets/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Included — constitution requires tests for new public functions and state classes.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Types, storage client wrappers, and directory structure

- [ ] T001 Define `AgentPreset` type and `AgentSource` union in `apps/tauri/src/business/agent-preset/types.ts` (fields: id, name, providerName, model, prompt, source, createdAt, updatedAt per data-model.md)
- [ ] T002 [P] Add `createAgent`, `updateAgent`, `deleteAgent` invoke wrappers to `apps/tauri/src/business/chatting/storage/tauriStorageClient.ts` (matching existing `getAgent`/`getAllAgents` pattern)
- [ ] T003 [P] Define `FileAgentResult` and `FileAgent` types in `apps/tauri/src/business/agent-preset/types.ts` and add `getFileAgents` wrapper to `apps/tauri/src/business/chatting/storage/tauriStorageClient.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state management and Rust backend that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Implement `AgentPresetState` singleton in `apps/tauri/src/business/agent-preset/AgentPresetState.ts` — BehaviorSubject<AgentPreset[]> for agent list, BehaviorSubject<number> for activeIndex, `cycleNext()` method (wraps around), `getActiveAgent$()` derived observable using `combineLatest` + `distinctUntilChanged`, `initialize()` method that loads UI agents via `getAllAgents()` and merges (UI agents first by createdAt, file agents after). Include `reload()` for refreshing after CRUD operations. Expose `getAgents$()` for list consumers.
- [ ] T005 Write unit tests for `AgentPresetState` in `apps/tauri/src/business/agent-preset/AgentPresetState.test.ts` — test cases: cycleNext with 3 agents cycles 0→1→2→0, cycleNext with 1 agent stays at 0, cycleNext with empty list does nothing, merge ordering (UI before file agents), activeAgent$ emits correct agent after cycle, reload after agent deletion adjusts activeIndex if out of bounds.
- [ ] T006 Implement `get_file_agents` Rust command in `apps/tauri/src-tauri/src/storage/config.rs` — reads `*.json` files from `app_config_dir/agents/`, parses single object or array, validates required fields (name non-empty, providerName non-empty, model non-empty), assigns deterministic IDs `file:{filename}:{index}`, returns `FileAgentResult { agents, warnings }`. Empty/missing directory returns empty result (not error).
- [ ] T007 Register `config` module in `apps/tauri/src-tauri/src/storage/mod.rs` and register `get_file_agents` command in `apps/tauri/src-tauri/src/lib.rs` invoke_handler

**Checkpoint**: AgentPresetState singleton and Rust backend ready — user story implementation can begin

---

## Phase 3: User Story 1 — Switch Agent with Tab Key (Priority: P1) 🎯 MVP

**Goal**: Users can press Tab to cycle through agents, see which agent is active, and messages use the selected agent's config.

**Independent Test**: Press Tab repeatedly in chat input → agent indicator changes next to Submit button → send a message → correct agent provider/model used.

### Tests for User Story 1

- [ ] T008 [P] [US1] Write test for Tab key handling logic in `apps/tauri/src/business/agent-preset/AgentPresetState.test.ts` — verify `cycleNext()` is called on Tab, verify it does NOT cycle when `isOpen` (slash command popover) is true

### Implementation for User Story 1

- [ ] T009 [US1] Add Tab key handler to `handleKeyDown` in `apps/tauri/src/business/chatting/input/ChatInputView.tsx` — when `e.key === 'Tab' && !isOpen`, call `e.preventDefault()` and `AgentPresetState.getInstance().cycleNext()`
- [ ] T010 [US1] Add agent indicator to bottom bar in `apps/tauri/src/business/chatting/input/ChatInputView.tsx` — subscribe to `AgentPresetState.getInstance().getActiveAgent$()`, display agent name as a small label/badge in the `div.flex.flex-row.gap-2` container next to Submit button (left side). Use @allin/ui Button variant="ghost" size="sm" with the agent name text.
- [ ] T011 [US1] Initialize `AgentPresetState` on app mount — call `AgentPresetState.getInstance().initialize()` in the top-level component or `ChattingView` on first render (similar to how `slashCommandManager.registerCommands` is called in ChatInputView useEffect)
- [ ] T012 [US1] Wire active agent to `useChat.ts` in `apps/tauri/src/business/chatting/useChat.ts` — subscribe to `AgentPresetState.getInstance().getActiveAgent$()`, when active agent changes and chatFacade exists, create new `TauriChatTransport` with the new agent's providerName/model and call `chatFacade.updateTransport(transport, providerName, modelId)`. Handle system prompt change by managing system messages on the facade.

**Checkpoint**: Tab cycling works, agent indicator displays, messages use selected agent. US1 fully functional.

---

## Phase 4: User Story 2 — Create Agent via UI (Priority: P2)

**Goal**: Users can create new agent presets through command palette UI with name, provider, model, and optional prompt.

**Independent Test**: Open command palette (⌘+J) → navigate to Agents → create new agent → verify it appears in Tab rotation.

### Implementation for User Story 2

- [ ] T013 [US2] Add `'agent-list'` and `'agent-create'` to `CommandPaneId` union in `apps/tauri/src/business/command-palette/types.ts`
- [ ] T014 [P] [US2] Add agent pane routes to `CommandPaletteView.tsx` in `apps/tauri/src/business/command-palette/CommandPaletteView.tsx` — add `.with('agent-list', () => <AgentListView />)` and `.with('agent-create', () => <AgentCreateView />)` to the ts-pattern match (import the new components)
- [ ] T015 [P] [US2] Add "Agents" entry to `HomeCommandView.tsx` in `apps/tauri/src/business/command-palette/panes/HomeCommandView.tsx` — add a CommandItem that navigates to `'agent-list'` pane (similar to existing "Providers" and "Models" entries)
- [ ] T016 [US2] Implement `AgentCreateView` in `apps/tauri/src/business/command-palette/panes/AgentCreateView.tsx` — CommandDialog with form fields: name (text input, required), provider (select from ProviderIdSchema.options with icons using getProviderIcon), model (select from MODEL_IDS_PER_PROVIDER[selectedProvider]), prompt (textarea, optional). On save: validate name non-empty, construct StorageAgent with `crypto.randomUUID()` id and current timestamps, call `createAgent()` from tauriStorageClient, call `AgentPresetState.getInstance().reload()`, close dialog. On validation error: show inline error message. Follow existing ProviderConfigCommandView pattern for dialog structure.
- [ ] T017 [US2] Implement `AgentListView` (read-only list for now, edit/delete in US4) in `apps/tauri/src/business/command-palette/panes/AgentListView.tsx` — CommandDialog listing all agents from `AgentPresetState.getInstance().getAgents$()`. Each item shows agent name, provider icon, model name, and a source badge ("UI" or "File"). Include a "Create Agent" action item at the top that navigates to `'agent-create'` pane. Follow existing ProvidersCommandView pattern.

**Checkpoint**: Users can create agents via UI and they appear in Tab rotation. US2 fully functional.

---

## Phase 5: User Story 3 — Create Agent via JSON File (Priority: P2)

**Goal**: Users can place JSON files in config directory and agents are loaded at startup.

**Independent Test**: Place a valid JSON file in `~/.config/sh.allin.app/agents/`, restart app, verify file agents appear in Tab rotation with "File" source badge.

### Tests for User Story 3

- [ ] T018 [P] [US3] Write unit tests for file agent loading/validation in `apps/tauri/src/business/agent-preset/fileAgentLoader.test.ts` — test `parseFileAgents()` with: valid array of agents, single object auto-wrapped, missing required field skipped, empty name skipped, invalid JSON returns empty with warning, empty array returns empty

### Implementation for User Story 3

- [ ] T019 [US3] Implement `parseFileAgents` validation utility in `apps/tauri/src/business/agent-preset/fileAgentLoader.ts` — pure function that takes `FileAgentResult` from Rust command and converts to `AgentPreset[]` with `source: 'file'`. Validates each entry (name non-empty, providerName valid via ProviderIdSchema.safeParse, model non-empty). Returns valid agents and logs warnings via `console.warn` for skipped entries.
- [ ] T020 [US3] Integrate file agent loading into `AgentPresetState.initialize()` in `apps/tauri/src/business/agent-preset/AgentPresetState.ts` — call `getFileAgents()` from tauriStorageClient, pass result through `parseFileAgents()`, merge file agents after UI agents in the combined list. Show warning toasts for any `warnings` from the Rust command result.

**Checkpoint**: JSON-defined agents load at startup and appear in Tab rotation alongside UI agents. US3 fully functional.

---

## Phase 6: User Story 4 — Edit and Delete Agents via UI (Priority: P3)

**Goal**: Users can edit and delete UI-created agents through the command palette. JSON agents are displayed as read-only.

**Independent Test**: Open agent list → edit a UI agent's name/model → verify changes reflected. Delete an agent → verify removed from Tab rotation. Verify file agents show as read-only.

### Implementation for User Story 4

- [ ] T021 [US4] Add edit/delete actions to `AgentListView` in `apps/tauri/src/business/command-palette/panes/AgentListView.tsx` — for UI-sourced agents (`source === 'user'`), add edit icon button (navigates to `'agent-create'` pane with `agentId` in paneProps for edit mode) and delete icon button (confirms deletion, calls `deleteAgent(id)` from tauriStorageClient, then `AgentPresetState.getInstance().reload()`). For file-sourced agents (`source === 'file'`), show read-only badge, no action buttons. Use ts-pattern for source type branching.
- [ ] T022 [US4] Add edit mode to `AgentCreateView` in `apps/tauri/src/business/command-palette/panes/AgentCreateView.tsx` — if `paneProps.agentId` is provided, load existing agent via `getAgent(id)` and pre-fill form fields. On save in edit mode: call `updateAgent()` instead of `createAgent()`, preserve original id and createdAt, update updatedAt. Call `AgentPresetState.getInstance().reload()` after save.
- [ ] T023 [US4] Handle active agent deletion edge case in `AgentPresetState.reload()` in `apps/tauri/src/business/agent-preset/AgentPresetState.ts` — after reloading agents, if activeIndex >= new agents.length, clamp to agents.length - 1 (or 0 if empty). Emit updated activeAgent$.

**Checkpoint**: Full agent lifecycle management works. All 4 user stories functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T024 [P] Run `pnpm check-ts` and fix any TypeScript errors across all changed files
- [ ] T025 [P] Run `pnpm lint:fix` and fix any Biome lint issues across all changed files
- [ ] T026 Run `pnpm test:once` and verify all tests pass (existing + new)
- [ ] T027 Run `pnpm build` and verify successful build with zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 types (T001) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2). Can run in parallel with US1.
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2). Can run in parallel with US1/US2.
- **User Story 4 (Phase 6)**: Depends on US2 (Phase 4) for AgentListView and AgentCreateView
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational. No story dependencies.
- **US2 (P2)**: Independent after Foundational. No story dependencies.
- **US3 (P2)**: Independent after Foundational. No story dependencies.
- **US4 (P3)**: Depends on US2 (reuses AgentListView and AgentCreateView).

### Within Each User Story

- Types/models before services/state
- State logic before UI components
- Core behavior before polish

### Parallel Opportunities

- T002 + T003: Different sections of same file but independent wrappers
- T014 + T015: Different files in command-palette
- T018 + T019: Test can be written before implementation (TDD)
- US1 + US2 + US3: All independent after Foundational phase, can proceed in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# After T004 (AgentPresetState):
Task T005: "Unit tests for AgentPresetState" [P - tests file]
Task T006: "Rust get_file_agents command"     [P - different language/layer]
Task T007: "Register config module in Rust"   [depends on T006]
```

## Parallel Example: User Stories After Foundational

```bash
# All three can start simultaneously:
US1 (Phase 3): T009 → T010 → T011 → T012
US2 (Phase 4): T013 → T014+T015 [P] → T016 → T017
US3 (Phase 5): T018 [P] → T019 → T020
# Then US4 after US2 completes:
US4 (Phase 6): T021 → T022 → T023
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007)
3. Complete Phase 3: User Story 1 (T008-T012)
4. **STOP and VALIDATE**: Tab cycles agents, indicator shows, messages use correct config
5. This alone delivers the core value proposition

### Incremental Delivery

1. Setup + Foundational → Core infrastructure ready
2. Add US1 → Tab switching works → **MVP deployed**
3. Add US2 → UI creation works → Users can create agents
4. Add US3 → JSON loading works → Power users can use file configs
5. Add US4 → Edit/delete works → Full lifecycle management
6. Polish → Quality gates pass → Production ready

---

## Notes

- Rust backend already has full agent CRUD — no new Rust work needed except `get_file_agents` (T006-T007)
- `ChatFacade.updateTransport()` already exists for mid-conversation switching — no new facade work needed
- All new UI uses existing @allin/ui components and command palette patterns
- Agent indicator placement: bottom bar next to Submit button (spec clarification)
- Tab key only: no Shift+Tab reverse cycling (spec clarification)
