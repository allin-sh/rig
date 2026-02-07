# Feature Specification: Agent Presets

**Feature Branch**: `002-agent-presets`  
**Created**: 2025-02-07  
**Updated**: 2026-02-07  
**Status**: Implemented  
**Input**: User description: "미리 agent 를 정의할 수 있고 tab 을 누르면 선택된 agent 가 변경될 수 있는 기능을 추가하고 싶어. ui 에서 에이전트를 만들수도 있고, 아니면 특정 경로에 json 파일을 통해서 추가할수도 있게 하고 싶어."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Agent with Tab Key (Priority: P1)

Users can quickly switch between pre-defined agents by pressing the Tab key in the chat input area. Each Tab press cycles to the next agent in the list, and the currently selected agent is visually displayed near the chat input so the user always knows which agent is active. The indicator always shows the agent name and model ID, and is visible even when no agents have been created (displaying "Default").

**Why this priority**: This is the core interaction that makes agent presets useful. Without quick switching, the feature has no real value over manual model selection.

**Independent Test**: Can be fully tested by pressing Tab repeatedly in the chat input and verifying the displayed agent changes each time. Delivers immediate value by enabling fast context switching between agents.

**Acceptance Scenarios**:

1. **Given** two or more agents are defined, **When** user presses Tab in the chat input area, **Then** the active agent switches to the next agent in the list and the UI reflects the change
2. **Given** the last agent in the list is active, **When** user presses Tab, **Then** the active agent wraps around to the first agent in the list
3. **Given** only one agent is defined, **When** user presses Tab, **Then** nothing changes (the single agent remains selected)
4. **Given** the user switches agents via Tab, **When** the user sends a message, **Then** the message is processed using the newly selected agent's provider, model, and system prompt
5. **Given** the user is in an existing conversation, **When** the user presses Tab and switches agents mid-conversation, **Then** the next message uses the newly selected agent's configuration while previous messages remain unchanged
6. **Given** no agents are defined, **When** the user views the chat input area, **Then** the agent indicator shows "Default" (always visible)
7. **Given** an agent is active, **When** the user views the agent indicator, **Then** the indicator shows the agent name and model ID

---

### User Story 2 - Create Agent via UI (Priority: P2)

Users can create new agent presets through the application's command palette UI. The creation flow allows users to set the agent's name, choose a provider and model, and optionally define a system prompt. Created agents immediately appear in the Tab-switching rotation.

**Why this priority**: Users need a way to create agents without touching files. This is the primary creation method for most users.

**Independent Test**: Can be tested by opening the agent creation UI, filling in the required fields, saving, and verifying the new agent appears in the Tab-switching list.

**Acceptance Scenarios**:

1. **Given** the user opens the agent creation interface, **When** they fill in name, provider, model, and optionally a system prompt, **Then** the agent is saved and available in the Tab-switching rotation
2. **Given** the user creates a new agent, **When** they return to the chat input, **Then** the new agent appears as an option when pressing Tab
3. **Given** the user tries to save an agent without a name, **When** they attempt to save, **Then** the system shows a validation error

---

### User Story 3 - Create Agent via JSON File (Priority: P2)

Users can define agents by placing JSON files in a designated directory. The backend reads these files and merges them internally with UI-created agents. The frontend receives a single unified agent list — it does not need to know the origin of each agent.

**Why this priority**: Power users and teams need a file-based workflow to share agent configurations, version-control them, or batch-create presets.

**Independent Test**: Can be tested by placing a valid JSON file in the designated directory, launching or refreshing the app, and verifying the defined agents appear in the Tab-switching list.

**Acceptance Scenarios**:

1. **Given** a valid agent JSON file exists in the designated directory, **When** the application loads, **Then** the agents defined in that file are available in the Tab-switching rotation
2. **Given** a JSON file contains invalid data (missing required fields), **When** the application loads, **Then** the invalid entry is skipped and a warning is shown to the user
3. **Given** a JSON-defined agent has the same name as a UI-created agent, **When** the application loads, **Then** both agents are available (no silent overwriting)

---

### User Story 4 - Edit and Delete Agents via UI (Priority: P3)

Users can modify or remove existing UI-created agents through the application's interface. Changes take effect immediately in the Tab-switching rotation. File-sourced agents are displayed as read-only. The agent's origin ("user" or "file") is determined by a `source` field provided by the backend.

**Why this priority**: Lifecycle management of agents is important but not as critical as creation and switching.

**Independent Test**: Can be tested by selecting an existing agent, editing its fields, saving, and verifying the changes are reflected. Deletion can be tested by removing an agent and confirming it no longer appears in the Tab rotation.

**Acceptance Scenarios**:

1. **Given** a UI-created agent exists, **When** the user edits its name, model, or prompt and saves, **Then** the changes are immediately reflected in the Tab-switching rotation
2. **Given** a UI-created agent exists, **When** the user deletes it, **Then** the agent is removed from the Tab-switching rotation
3. **Given** a JSON-defined agent exists, **When** the user views it in the UI, **Then** the agent is displayed as read-only (cannot be edited or deleted from UI)

---

### Edge Cases

- What happens when no agents are defined at all? The agent indicator shows "Default" with no model info. Tab key has no effect.
- What happens when the currently active agent is deleted? The system clamps the active index to the last available agent, or resets to index 0 if the list is empty.
- What happens when the JSON file is modified while the application is running? Changes are picked up on next application restart (hot-reload of JSON is not required).
- What happens when Tab is pressed while a slash command popover is open? Tab should not switch agents while the popover is active — the popover takes input priority.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to define agent presets consisting of a name, provider, model, and optional system prompt
- **FR-002**: System MUST allow users to cycle forward through defined agents by pressing Tab in the chat input area (no reverse cycling via Shift+Tab)
- **FR-003**: System MUST visually display the currently selected agent in the bottom bar next to the Submit button, showing both agent name and model ID
- **FR-004**: System MUST show an agent indicator at all times — displaying "Default" when no agents exist
- **FR-005**: System MUST allow users to create agent presets through the application's command palette UI
- **FR-006**: System MUST allow users to create agent presets by placing JSON files in a designated directory
- **FR-007**: System MUST validate agent definitions (both UI and JSON) for required fields before accepting them
- **FR-008**: System MUST persist UI-created agents in a single aggregated storage file across application restarts
- **FR-009**: System MUST merge agents from both sources (UI and JSON) into a single unified list on the backend; the frontend receives one flat agent list
- **FR-010**: System MUST NOT switch agents via Tab when the slash command popover or other input overlays are active
- **FR-011**: System MUST allow users to edit and delete UI-created agents
- **FR-012**: System MUST treat JSON-defined agents as read-only in the UI, identified by a `source` field set to "file"
- **FR-013**: When the active agent changes, the next message sent MUST use that agent's provider, model, and system prompt
- **FR-014**: Agent switching via Tab MUST be available both in new chats and mid-conversation within existing channels

### Key Entities

- **Agent Preset**: A named configuration consisting of name (unique display label), provider (AI service), model (specific model within provider), system prompt (optional instructions prepended to conversations), and source (origin of the agent). Stored in a single aggregated file on the backend.
- **Agent Source**: A string field (`source`) on each agent indicating its origin — either "user" (created via UI, mutable) or "file" (loaded from JSON, read-only in UI). This distinction is resolved by the backend; the frontend simply reads the field.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between agents in under 0.5 seconds using the Tab key
- **SC-002**: Users can create a new agent preset through the UI in under 1 minute
- **SC-003**: JSON-defined agents are loaded and available within 2 seconds of application start
- **SC-004**: 100% of messages sent after agent switching use the correct agent's configuration
- **SC-005**: All invalid agent definitions (UI or JSON) produce clear, actionable feedback to the user
- **SC-006**: Agent indicator is always visible in the chat input area, even when no agents are defined

## Clarifications

### Session 2025-02-07

- Q: When should Tab-based agent switching be available? → A: Always available — agent can be switched mid-conversation (next message uses new agent)
- Q: Should Shift+Tab cycle backwards through the agent list? → A: No — Tab only, forward cycling with wrap-around is sufficient
- Q: Where should the active agent indicator be displayed? → A: In the bottom bar next to the Submit button

### Session 2026-02-07

- Q: Should the frontend distinguish between user-created and file-loaded agents? → A: No — the backend merges both sources internally and returns a unified list. The frontend only sees a single `agent` concept with an optional `source` field.
- Q: How should agents be stored on the backend? → A: In a single aggregated `agent.json` file (not one file per agent). This follows the same pattern as the messages storage.
- Q: Should the agent indicator show the model ID? → A: Yes — the indicator shows both the agent name and model ID.
- Q: What should be shown when no agents are defined? → A: The indicator always shows, displaying "Default" with no model info.

## Assumptions

- The designated directory for JSON agent files is within the app's configuration directory (e.g., `~/.config/allin/agents/` or equivalent per platform).
- Tab key is not currently used for any other function in the chat input area, so reassigning it to agent switching is safe.
- Agent ordering in the Tab rotation follows creation order (sorted by `createdAt`). The backend places user agents and file agents in a single list.
- When no agents exist, the UI shows a "Default" indicator. The default has no associated model — it's a UI-only fallback label.
- JSON agent files use a straightforward schema: each file contains an array of agent objects.
