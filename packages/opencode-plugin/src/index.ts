import { appendFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import type { Plugin } from '@opencode-ai/plugin';

const DEFAULT_LOG_PATH = '~/.rig/usage.jsonl';
const DEFAULT_SOURCE = 'opencode';

export interface RigSkillUsageLogEntry {
  source: string;
  skillName: string;
  usedAt: string;
}

export const RigSkillUsagePlugin: Plugin = async () => {
  return {
    'tool.execute.after': async (input, output) => {
      if (isDisabled()) {
        return;
      }

      if (!isSkillTool(input)) {
        return;
      }

      const skillName = getSkillName(input, output);

      if (!skillName) {
        return;
      }

      await appendUsage({
        source: process.env.RIG_USAGE_SOURCE || DEFAULT_SOURCE,
        skillName,
        usedAt: new Date().toISOString(),
      });
    },
  };
};

const appendUsage = async (entry: RigSkillUsageLogEntry) => {
  const logPath = expandPath(
    process.env.RIG_USAGE_LOG_PATH || DEFAULT_LOG_PATH,
  );

  await mkdir(dirname(logPath), { recursive: true });
  await appendFile(logPath, `${JSON.stringify(entry)}\n`, 'utf8');
};

const isDisabled = () => {
  const value = process.env.RIG_USAGE_DISABLED?.toLowerCase();

  return value === '1' || value === 'true';
};

const isSkillTool = (input: unknown) => {
  return getStringProperty(input, 'tool') === 'skill';
};

const getSkillName = (input: unknown, output: unknown) => {
  const candidates = [
    input,
    output,
    getObjectProperty(input, 'args'),
    getObjectProperty(output, 'args'),
    getObjectProperty(input, 'input'),
    getObjectProperty(output, 'input'),
  ];

  for (const candidate of candidates) {
    const skillName =
      getStringProperty(candidate, 'skillName') ??
      getStringProperty(candidate, 'skill_name') ??
      getStringProperty(candidate, 'name') ??
      getStringProperty(candidate, 'skill');

    if (skillName) {
      return skillName;
    }
  }

  return null;
};

const getObjectProperty = (value: unknown, key: string) => {
  if (!isRecord(value)) {
    return null;
  }

  const property = value[key];

  return isRecord(property) ? property : null;
};

const getStringProperty = (value: unknown, key: string) => {
  if (!isRecord(value)) {
    return null;
  }

  const property = value[key];

  return typeof property === 'string' && property.trim().length > 0
    ? property
    : null;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const expandPath = (path: string) => {
  if (path === '~') {
    return homedir();
  }

  if (path.startsWith('~/')) {
    return resolve(homedir(), path.slice(2));
  }

  return resolve(path);
};
