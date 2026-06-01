# rig-opencode

OpenCode plugin that records skill usage to a local JSONL file for Rig.

## Install

Add the npm package to your OpenCode config.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["rig-opencode"]
}
```

OpenCode installs npm plugins automatically with Bun at startup.

## What It Records

When OpenCode executes the native `skill` tool, the plugin appends one JSON line:

```json
{"source":"opencode","skillName":"typescript-fix-null-safety","usedAt":"2026-05-30T01:12:00.000Z"}
```

Default log path:

```txt
~/.rig/usage.jsonl
```

Rig reads this file to show skill usage counts and dashboard summaries.

## Environment Variables

The plugin works without any environment variables. Use these only when you want
to customize where logs are written or temporarily disable tracking.

| Name | Default | Description |
| --- | --- | --- |
| `RIG_USAGE_LOG_PATH` | `~/.rig/usage.jsonl` | JSONL file path to append usage events to. |
| `RIG_USAGE_SOURCE` | `opencode` | Source value written into each event. |
| `RIG_USAGE_DISABLED` | unset | Set to `1` or `true` to disable recording. |

Examples:

```bash
# Write usage logs somewhere else
RIG_USAGE_LOG_PATH=./.rig/usage/rig-usage.jsonl opencode

# Override the source field
RIG_USAGE_SOURCE=opencode-local opencode

# Temporarily disable tracking
RIG_USAGE_DISABLED=1 opencode
```

## Local Development

```bash
pnpm --filter rig-opencode check-ts
pnpm --filter rig-opencode build
```
