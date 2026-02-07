# Data Model: Agent Presets

**Branch**: `002-agent-presets` | **Date**: 2025-02-07

## Entities

### AgentPreset (unified frontend type)

Represents an agent preset from any source, used throughout the frontend.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | Unique identifier. UUID for UI-created, deterministic ID for file-based (e.g., `file:{filename}:{index}`) |
| name | string | ✅ | Display label shown in the agent indicator |
| providerName | ProviderId | ✅ | AI provider (`'openai' \| 'google' \| 'anthropic'`) |
| model | string | ✅ | Model ID within the provider |
| prompt | string \| null | ❌ | Optional system prompt prepended to conversations |
| source | AgentSource | ✅ | Origin of this agent definition |
| createdAt | number | ✅ | Unix timestamp (ms) |
| updatedAt | number | ✅ | Unix timestamp (ms) |

### AgentSource (discriminated union)

| Value | Description |
|-------|-------------|
| `'user'` | Created via UI, stored in Tauri backend. Mutable (edit/delete allowed). |
| `'file'` | Loaded from JSON config file. Read-only in UI. |

### StorageAgent (existing Rust entity — no changes needed)

Already defined in `src-tauri/src/storage/entities.rs`:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | String | ✅ | |
| name | String | ✅ | |
| provider_name | String | ✅ | camelCase in JSON: `providerName` |
| model | String | ✅ | |
| prompt | Option\<String\> | ❌ | |
| created_at | i64 | ✅ | Unix timestamp (seconds) |
| updated_at | i64 | ✅ | Unix timestamp (seconds) |

### FileAgentDefinition (JSON file schema)

The schema for agent definitions in JSON config files:

```json
[
  {
    "name": "Code Reviewer",
    "providerName": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "prompt": "You are a senior code reviewer. Focus on correctness, performance, and maintainability."
  }
]
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | ✅ | Non-empty, trimmed |
| providerName | string | ✅ | Must be valid ProviderId |
| model | string | ✅ | Non-empty |
| prompt | string \| null | ❌ | Optional |

A single file can contain either:
- An array of agent objects
- A single agent object (auto-wrapped into array)

## State Transitions

### AgentPresetState Lifecycle

```
[App Start]
    │
    ├── Load UI agents from Rust backend (getAllAgents)
    ├── Load file agents from config dir (getFileAgents)
    │
    ▼
[Agents Merged] ── agents$: BehaviorSubject<AgentPreset[]>
    │                activeIndex$: BehaviorSubject<number> (default: 0)
    │
    ├── Tab pressed → cycleNext() → activeIndex = (activeIndex + 1) % agents.length
    ├── Agent created via UI → reload UI agents → merge → emit
    ├── Agent edited via UI → reload UI agents → merge → emit
    ├── Agent deleted via UI → reload UI agents → merge → adjust activeIndex if needed → emit
    │
    ▼
[Active Agent Changed] ── activeAgent$: Observable<AgentPreset>
    │
    ▼
[ChatFacade.updateTransport()] ── next message uses new agent config
```

### Merge Strategy

1. UI agents (from `getAllAgents()`) come first, ordered by `createdAt`
2. File agents (from config dir) come after, ordered by file name then array index
3. If no agents exist at all, a default agent is auto-created by the Rust backend

## Relationships

```
AgentPresetState (1) ──manages──▶ (N) AgentPreset
AgentPreset (1) ──references──▶ (1) ProviderId (from @allin/ai)
StorageChannel (1) ──has──▶ (0..1) agentId ──references──▶ AgentPreset.id
ChatFacade (1) ──uses──▶ (1) active AgentPreset (via updateTransport)
```

## Validation Rules

- **Name**: Must be non-empty after trimming. Duplicates across sources are allowed (spec clarification).
- **ProviderName**: Must be one of `ProviderIdSchema.options` (`'openai' | 'google' | 'anthropic'`).
- **Model**: Must be non-empty string. Validation against `MODEL_IDS_PER_PROVIDER` is recommended but not blocking (models can be added/removed).
- **File agents**: Invalid entries in JSON files are skipped with a warning toast. Valid entries in the same file are still loaded.
