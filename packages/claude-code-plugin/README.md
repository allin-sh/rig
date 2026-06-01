# rig-claude-code

Claude Code plugin for tracking Rig skill usage locally.

## Installation

Copy this entire folder into your Claude Code skills directory:

```sh
mkdir -p ~/.claude/skills
cp -R ./packages/claude-code-plugin ~/.claude/skills/rig-claude-code
```

Then start Claude Code normally:

```sh
claude
```

The plugin records skill usage to:

```text
~/.rig/usage.jsonl
```
