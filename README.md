# Rig

Rig is a local-first desktop app for organizing scattered agent SKILL files before they become a mess.

Browse every local skill from one place, edit files without jumping between folders, and track which skills are actually being used.

## Why Rig?

Agent SKILL files are powerful, but they are easy to lose track of once they spread across projects, config folders, and local experiments.

Rig gives you one focused desktop workspace for finding, editing, and understanding the skills already living on your machine.

## MVP Features

- **Browse local SKILL files**
  Discover and inspect SKILL files from one place.
- **Edit skills directly**
  Update SKILL files in place without switching between folders and editors.
- **Track skill usage**
  See invocation counts and understand which skills are actually being used.

## Status

Rig is currently in MVP development.

## Install Rig

Download the latest macOS app from the [Rig releases page](https://github.com/builder-mafia/rig/releases).

Open the downloaded `.dmg`, drag Rig into Applications, then launch Rig.

## Set Up Usage Tracking

Rig can show skill usage when OpenCode or Claude Code writes usage events to the local Rig log file:

```text
~/.rig/usage.jsonl
```

The desktop app reads this file automatically.

## OpenCode Plugin

Add the `rig-opencode` plugin to your OpenCode config. The config file is usually at `~/.config/opencode/opencode.json`.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["rig-opencode"]
}
```

Restart OpenCode after saving the config. OpenCode installs npm plugins automatically at startup.

## Claude Code Plugin

Install the Rig Claude Code plugin into your Claude Code skills directory:

```bash
tmpdir=$(mktemp -d)
git clone --depth 1 https://github.com/builder-mafia/rig.git "$tmpdir/rig"
mkdir -p ~/.claude/skills
rm -rf ~/.claude/skills/rig-claude-code
cp -R "$tmpdir/rig/packages/claude-code-plugin" ~/.claude/skills/rig-claude-code
```

Restart Claude Code after installing the plugin:

```bash
claude
```

After setup, use skills normally in OpenCode or Claude Code. Rig will pick up new usage events from `~/.rig/usage.jsonl`.

## Development

```bash
pnpm install
pnpm dev:app
```


## License

See [LICENSE](LICENSE).
