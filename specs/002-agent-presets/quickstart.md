# Quickstart: Agent Presets

**Branch**: `002-agent-presets` | **Date**: 2025-02-07

## What This Feature Does

Allows users to pre-define AI agent configurations (name + provider + model + system prompt) and switch between them instantly using the Tab key in the chat input area. Agents can be created through the UI or by placing JSON files in a config directory.

## Key Files to Understand First

| File | Why |
|------|-----|
| `apps/tauri/src/business/chatting/input/ChatInputView.tsx` | Where Tab key handling and agent indicator will be added |
| `apps/tauri/src/business/chatting/useChat.ts` | Where agent → ChatFacade binding happens |
| `apps/tauri/src/business/chatting/facade/ChatFacade.ts` | Has `updateTransport()` for mid-conversation switching |
| `apps/tauri/src/business/chatting/storage/tauriStorageClient.ts` | Tauri invoke wrappers (need to add create/update/delete) |
| `apps/tauri/src/business/chatting/storage/types.ts` | `StorageAgent` type definition |
| `apps/tauri/src-tauri/src/storage/agent.rs` | Rust backend CRUD (already complete) |
| `apps/tauri/src-tauri/src/storage/commands.rs` | Rust Tauri command handlers (already registered) |
| `apps/tauri/src/business/command-palette/` | Pattern for adding new UI panes |

## Implementation Order

### 1. AgentPresetState singleton (core logic, no UI)

Create `apps/tauri/src/business/agent-preset/AgentPresetState.ts`:
- `BehaviorSubject<AgentPreset[]>` for the agent list
- `BehaviorSubject<number>` for active index
- `cycleNext()` method
- `getActiveAgent$()` observable
- `initialize()` loads from both sources and merges

Write tests in `AgentPresetState.test.ts` for cycling, empty list fallback, merge ordering.

### 2. Frontend storage client wrappers

Add `createAgent`, `updateAgent`, `deleteAgent`, `getFileAgents` to `tauriStorageClient.ts`.

### 3. Rust: config file reader command

Add `get_file_agents` command in `src-tauri/src/storage/config.rs`. Register in `lib.rs`.

### 4. Tab key handling in ChatInputView

Modify `handleKeyDown` in `ChatInputView.tsx`:
- Add `Tab` case when `!isOpen`
- Call `AgentPresetState.getInstance().cycleNext()`
- `e.preventDefault()` to block default Tab behavior

### 5. Agent indicator in bottom bar

Add agent name display next to Submit button in `ChatInputView.tsx`. Subscribe to `AgentPresetState.getInstance().getActiveAgent$()`.

### 6. Mid-conversation agent switching in useChat

When active agent changes, call `chatFacade.updateTransport()` with new transport config.

### 7. Command palette panes (agent CRUD UI)

Add `AgentListView` and `AgentCreateView` to command palette. Follow exact same pattern as `ProvidersCommandView` / `ProviderConfigCommandView`.

## Running Tests

```bash
# Run all tests
pnpm test:once

# Run agent preset tests specifically
cd apps/tauri && pnpm vitest run src/business/agent-preset/
```

## Manual Testing

1. Start the app: `pnpm dev:app`
2. Press Tab in chat input → should cycle through agents
3. Check agent indicator updates next to Submit button
4. Open command palette (⌘+J) → navigate to Agents
5. Create a new agent, verify it appears in Tab rotation
6. Place a JSON file in `~/.config/sh.allin.app/agents/test.json`:
   ```json
   [{"name": "Test Agent", "providerName": "openai", "model": "gpt-4.1-nano"}]
   ```
7. Restart app → verify file agent appears in Tab rotation (read-only badge in UI)
