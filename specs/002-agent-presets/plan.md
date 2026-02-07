# Implementation Plan: Agent Presets

**Branch**: `002-agent-presets` | **Date**: 2025-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-agent-presets/spec.md`

## Summary

Add pre-defined agent presets that users can cycle through via Tab key in the chat input. Agents can be created/edited via UI (persisted through Tauri Rust backend) or loaded from JSON files in the app's config directory. A new `AgentPresetState` singleton manages the combined agent list and active selection, exposed to `ChatInputView` via a reactive indicator in the bottom bar. Mid-conversation agent switching is supported by leveraging `ChatFacade.updateTransport()`.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 15, React 19) + Rust (Tauri 2.x)  
**Primary Dependencies**: RxJS, ts-pattern, @allin/ai, @allin/ui (shadcn), cmdk, @tauri-apps/api/core  
**Storage**: Filesystem-based JSON via Rust backend (`app_data_dir/storage/agent/{id}/info.json`) + external JSON files from config directory  
**Testing**: Vitest  
**Target Platform**: Desktop (macOS, Windows, Linux) via Tauri  
**Project Type**: Monorepo (apps/tauri = desktop app, packages/* = shared)  
**Performance Goals**: Agent switch via Tab < 100ms UI response (constitution requirement); JSON file loading < 2s at startup  
**Constraints**: No new heavyweight dependencies (>50KB gzipped); all state via RxJS BehaviorSubject singletons  
**Scale/Scope**: Typical 1-50 agent presets per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clarity & Minimalism | ✅ PASS | Singleton + BehaviorSubject pattern matches existing codebase. No new abstractions beyond `AgentPresetState`. |
| II. Code Quality | ✅ PASS | Strict TypeScript, ts-pattern exhaustive matching for agent source types, View/State separation. |
| III. Testing Standards | ✅ PASS | Unit tests for AgentPresetState (cycling logic, validation), JSON parsing. |
| IV. UX Consistency | ✅ PASS | Uses @allin/ui components, Tailwind styling, command palette pane for agent CRUD. |
| V. Performance | ✅ PASS | Tab switch is synchronous state change (< 1ms). JSON file loading is async at startup only. |

**No violations. Proceeding to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/002-agent-presets/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── tauri-commands.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/tauri/
├── src/business/
│   ├── agent-preset/
│   │   ├── AgentPresetState.ts          # Singleton: combined agent list + active index
│   │   ├── AgentPresetState.test.ts     # Unit tests for cycling, validation, merge logic
│   │   ├── fileAgentLoader.ts           # Load & validate agents from JSON config dir
│   │   └── fileAgentLoader.test.ts      # Unit tests for JSON parsing/validation
│   ├── chatting/
│   │   ├── input/ChatInputView.tsx      # Modified: Tab handler + agent indicator
│   │   └── useChat.ts                   # Modified: react to active agent changes
│   ├── chatting/storage/
│   │   └── tauriStorageClient.ts        # Add: createAgent, updateAgent, deleteAgent wrappers
│   └── command-palette/
│       ├── types.ts                     # Add: 'agent-create', 'agent-list' pane IDs
│       ├── CommandPaletteView.tsx        # Add: agent pane routes
│       └── panes/
│           ├── AgentListView.tsx         # New: list agents with edit/delete actions
│           └── AgentCreateView.tsx       # New: form for creating/editing agents
├── src-tauri/src/storage/
│   ├── agent.rs                         # Existing: already has full CRUD
│   └── commands.rs                      # Existing: create_agent, update_agent, delete_agent already registered
│   # New Rust command needed:
│   ├── config.rs                        # New: read JSON files from config directory
│   └── mod.rs                           # Modified: add config module
└── src-tauri/src/lib.rs                 # Modified: register new config commands
```

**Structure Decision**: Follows existing monorepo layout. New `agent-preset/` directory under `business/` for the core state management. UI additions integrate into existing `command-palette/panes/` and `chatting/input/`. Rust backend already has agent CRUD — only a new config file reader command is needed.

## Complexity Tracking

> No constitution violations. No complexity justifications needed.
