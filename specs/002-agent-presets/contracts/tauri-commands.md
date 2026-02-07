# Tauri Command Contracts: Agent Presets

**Branch**: `002-agent-presets` | **Date**: 2025-02-07

## Existing Commands (no changes needed)

These Rust Tauri commands are already implemented and registered.

### `get_all_agents`

Returns all user-created agents. Auto-creates a default agent if none exist.

```typescript
// Frontend call
invoke('get_all_agents'): Promise<StorageAgent[]>
```

### `get_agent`

Returns a specific agent by ID.

```typescript
invoke('get_agent', { id: string }): Promise<StorageAgent>
```

### `create_agent`

Creates a new agent in filesystem storage.

```typescript
invoke('create_agent', { agent: StorageAgent }): Promise<void>
```

### `update_agent`

Updates an existing agent.

```typescript
invoke('update_agent', { agent: StorageAgent }): Promise<void>
```

### `delete_agent`

Deletes an agent. Prevents deletion of the last agent.

```typescript
invoke('delete_agent', { id: string }): Promise<void>
// Error: "Cannot delete the last agent" if only one agent remains
```

## New Commands

### `get_file_agents`

Reads agent definitions from JSON files in the app's config directory.

```typescript
invoke('get_file_agents'): Promise<FileAgentResult>
```

**Rust implementation location**: `src-tauri/src/storage/config.rs`

**Behavior**:
1. Resolve path: `app_config_dir/agents/`
2. List all `*.json` files in the directory
3. For each file:
   - Read and parse JSON
   - Accept either a single object or an array of objects
   - Validate required fields: `name` (non-empty string), `providerName` (string), `model` (non-empty string)
   - Assign deterministic IDs: `file:{filename}:{index}` (index is 0 for single objects)
   - Skip invalid entries, collect warnings
4. Return valid agents + warnings

**Response type**:

```typescript
type FileAgentResult = {
  agents: FileAgent[];
  warnings: string[];
};

type FileAgent = {
  id: string;           // e.g., "file:my-agents.json:0"
  name: string;
  providerName: string;
  model: string;
  prompt: string | null;
  sourceFile: string;   // filename for display purposes
};
```

**Error handling**:
- Directory doesn't exist → return `{ agents: [], warnings: [] }` (not an error)
- File can't be read → skip file, add warning
- JSON parse error → skip file, add warning
- Missing required field → skip entry, add warning

## Frontend Wrappers to Add

Add to `apps/tauri/src/business/chatting/storage/tauriStorageClient.ts`:

```typescript
export async function createAgent(agent: StorageAgent): Promise<void> {
  await invoke('create_agent', { agent });
}

export async function updateAgent(agent: StorageAgent): Promise<void> {
  await invoke('update_agent', { agent });
}

export async function deleteAgent(id: string): Promise<void> {
  await invoke('delete_agent', { id });
}

export async function getFileAgents(): Promise<FileAgentResult> {
  return invoke('get_file_agents');
}
```
