import type { ModelSpec } from '../../model-spec';
import type { AnthropicModelId } from '../anthropic-models';

export const anthropicModelSpec = {
  "claude-opus-4-6": {
    "id": "claude-opus-4-6",
    "name": "Claude Opus 4.6",
    "family": "claude-opus",
    "attachment": true,
    "reasoning": true,
    "tool_call": true,
    "temperature": true,
    "knowledge": "2025-05",
    "release_date": "2026-02-05",
    "last_updated": "2026-02-05",
    "modalities": {
      "input": [
        "text",
        "image",
        "pdf"
      ],
      "output": [
        "text"
      ]
    },
    "open_weights": false,
    "cost": {
      "input": 5,
      "output": 25,
      "cache_read": 0.5,
      "cache_write": 6.25,
      "context_over_200k": {
        "input": 10,
        "output": 37.5,
        "cache_read": 1,
        "cache_write": 12.5
      }
    },
    "limit": {
      "context": 200000,
      "output": 128000
    }
  },
  "claude-sonnet-4-6": {
    "id": "claude-sonnet-4-6",
    "name": "Claude Sonnet 4.6",
    "family": "claude-sonnet",
    "attachment": true,
    "reasoning": true,
    "tool_call": true,
    "temperature": true,
    "knowledge": "2025-08",
    "release_date": "2026-02-17",
    "last_updated": "2026-02-17",
    "modalities": {
      "input": [
        "text",
        "image",
        "pdf"
      ],
      "output": [
        "text"
      ]
    },
    "open_weights": false,
    "cost": {
      "input": 3,
      "output": 15,
      "cache_read": 0.3,
      "cache_write": 3.75,
      "context_over_200k": {
        "input": 6,
        "output": 22.5,
        "cache_read": 0.6,
        "cache_write": 7.5
      }
    },
    "limit": {
      "context": 200000,
      "output": 64000
    }
  },
  "claude-opus-4-5": {
    "id": "claude-opus-4-5",
    "name": "Claude Opus 4.5 (latest)",
    "family": "claude-opus",
    "attachment": true,
    "reasoning": true,
    "tool_call": true,
    "temperature": true,
    "knowledge": "2025-03-31",
    "release_date": "2025-11-24",
    "last_updated": "2025-11-24",
    "modalities": {
      "input": [
        "text",
        "image",
        "pdf"
      ],
      "output": [
        "text"
      ]
    },
    "open_weights": false,
    "cost": {
      "input": 5,
      "output": 25,
      "cache_read": 0.5,
      "cache_write": 6.25
    },
    "limit": {
      "context": 200000,
      "output": 64000
    }
  },
  "claude-sonnet-4-5": {
    "id": "claude-sonnet-4-5",
    "name": "Claude Sonnet 4.5 (latest)",
    "family": "claude-sonnet",
    "attachment": true,
    "reasoning": true,
    "tool_call": true,
    "temperature": true,
    "knowledge": "2025-07-31",
    "release_date": "2025-09-29",
    "last_updated": "2025-09-29",
    "modalities": {
      "input": [
        "text",
        "image",
        "pdf"
      ],
      "output": [
        "text"
      ]
    },
    "open_weights": false,
    "cost": {
      "input": 3,
      "output": 15,
      "cache_read": 0.3,
      "cache_write": 3.75
    },
    "limit": {
      "context": 200000,
      "output": 64000
    }
  }
} as const satisfies Record<AnthropicModelId, ModelSpec>;
