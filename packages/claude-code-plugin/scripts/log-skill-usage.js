import { appendFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';

const DEFAULT_LOG_PATH = '~/.rig/usage.jsonl';
const DEFAULT_SOURCE = 'claude-code';

const main = async () => {
  if (isDisabled()) {
    return;
  }

  const input = await readJsonFromStdin();
  const skillName = getSkillName(input);

  if (!skillName) {
    return;
  }

  await appendUsage({
    source: process.env.RIG_USAGE_SOURCE || DEFAULT_SOURCE,
    skillName,
    usedAt: new Date().toISOString(),
  });
};

const readJsonFromStdin = async () => {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getSkillName = (input) => {
  if (!isRecord(input)) {
    return null;
  }

  if (input.hook_event_name === 'UserPromptExpansion') {
    return getPromptExpansionSkillName(input);
  }

  if (input.hook_event_name === 'PostToolUse' && input.tool_name === 'Skill') {
    return getToolSkillName(input);
  }

  return null;
};

const getPromptExpansionSkillName = (input) => {
  if (input.expansion_type !== 'slash_command') {
    return null;
  }

  if (input.command_source === 'builtin') {
    return null;
  }

  return getStringProperty(input, 'command_name');
};

const getToolSkillName = (input) => {
  const toolInput = getObjectProperty(input, 'tool_input');
  const candidates = [
    toolInput,
    getObjectProperty(toolInput, 'input'),
    getObjectProperty(toolInput, 'args'),
  ];

  for (const candidate of candidates) {
    const skillName =
      getStringProperty(candidate, 'skillName') ??
      getStringProperty(candidate, 'skill_name') ??
      getStringProperty(candidate, 'command_name') ??
      getStringProperty(candidate, 'name') ??
      getStringProperty(candidate, 'skill');

    if (skillName) {
      return firstToken(skillName);
    }
  }

  const command =
    getStringProperty(toolInput, 'command') ??
    getStringProperty(toolInput, 'prompt');

  return command ? firstToken(command) : null;
};

const appendUsage = async (entry) => {
  const logPath = expandPath(process.env.RIG_USAGE_LOG_PATH || DEFAULT_LOG_PATH);

  await mkdir(dirname(logPath), { recursive: true });
  await appendFile(logPath, `${JSON.stringify(entry)}\n`, 'utf8');
};

const isDisabled = () => {
  const value = process.env.RIG_USAGE_DISABLED?.toLowerCase();

  return value === '1' || value === 'true';
};

const getObjectProperty = (value, key) => {
  if (!isRecord(value)) {
    return null;
  }

  const property = value[key];

  return isRecord(property) ? property : null;
};

const getStringProperty = (value, key) => {
  if (!isRecord(value)) {
    return null;
  }

  const property = value[key];

  return typeof property === 'string' && property.trim().length > 0
    ? property.trim()
    : null;
};

const isRecord = (value) => {
  return typeof value === 'object' && value !== null;
};

const firstToken = (value) => {
  const [token] = value.trim().split(/\s+/);

  return token || null;
};

const expandPath = (path) => {
  if (path === '~') {
    return homedir();
  }

  if (path.startsWith('~/')) {
    return resolve(homedir(), path.slice(2));
  }

  return resolve(path);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
