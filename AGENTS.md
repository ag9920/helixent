## Helixent

Helixent is a small library for building **ReAct-style** agent loops on the **Bun** stack.

This project is organized into **three layers**, plus a separate `community` area for third-party integrations.

## Architecture (3 layers)

### 1) `foundation`

Core primitives that everything else builds on:

- **Models**: the `Model` abstraction and provider-facing contracts.
- **Messages**: a single transcript type that flows end-to-end through the system.
- **Tools**: tool definitions and execution plumbing (the “actions” an agent can invoke).

Design intent:

- Keep these types stable and reusable.
- Prefer adding new backends by extending `ModelProvider`.
- Keep `Message` as the single source of truth for the conversation transcript.

### 2) `agent`

A reusable **ReAct-style agent loop**:

- Maintains state over a conversation transcript.
- Chooses between “think / act / observe” style steps (implementation details may vary, but the loop is the product).
- Orchestrates tool calls and feeds observations back into the next reasoning step.

- **Agent**: `src/agent/agent.ts`
- **Middleware**: `src/agent/agent-middleware.ts`
- **Skills**: `src/agent/skills/*`

This layer should depend only on `foundation`, and remain generic (not coding-specific).

### 3) `coding`

A layer for coding-specific agents and tools.

- **Leading Agent**: `src/coding/agents/lead-agent.ts`, `createCodingAgent()`
- **Tools**: `src/coding/tools/*`, including `bash`, `read_file`, `write_file`, `str_replace`

### 4) `community` (in-repo integrations)

In-repo integrations live under `src/community/*`.

- Treat these as optional adapters over `foundation` interfaces.
- Avoid coupling `foundation`/`agent` to integrations.

Current integrations:

- `src/community/openai`: `OpenAIModelProvider` backed by the `openai` SDK, using Chat Completions with function tools.

## `community` (external)

`community` contains **third-party integrations** that are maintained separately from the core layering above.

Guidelines:

- Treat it as optional and decoupled; avoid coupling `foundation`/`agent` to integrations.
- Prefer adapters that implement existing `foundation` interfaces instead of changing core types.

## Stack

- **Runtime / package manager**: [Bun](https://bun.com)
- **Language**: TypeScript (strict, `moduleResolution: "bundler"`)
- **Dependencies**: `openai` (provider SDK), `zod` (tool parameter schemas)

## Imports

- **Library (subpath) imports**: `helixent/*` maps to `./src/*` via `tsconfig` `paths`
    - Examples: `helixent/foundation`, `helixent/agent`, `helixent/community/openai`
- **Internal**: `@/*` maps to `./src/*`

Note: this repo currently uses **subpath** imports (e.g. `helixent/foundation`) in `index.ts`, not `import { … } from "helixent"`.

## Conventions

- Keep comments minimal and intent-focused.
- Avoid drive-by refactors outside the task at hand.
- Provider options: `OpenAIModelProvider` merges `Model.options` into `chat.completions.create` (provider-specific flags allowed). Defaults include `temperature: 0` and `top_p: 0`.
- Agent loop: when an assistant message contains tool calls, tools are invoked in parallel and appended as `tool_result` messages before continuing.

## Commands

```bash
bun install
bun run dev
bun run check
bun run check:types
bun run lint
bun run lint:fix
bun run build:js
bun run build:bin
```

Environment variables used by the sample root `index.ts` are provider-specific (e.g. `ARK_BASE_URL`, `ARK_API_KEY` for an OpenAI-compatible endpoint).

## Quality gate

Run `bun run check` as the main gate (`tsc --noEmit` + ESLint). Use `bun run check:types` for type-check-only validation.

## Notes

- `package.json`’s `build:js` script currently targets `./src/index.ts`, but the current `src/` tree does not include `src/index.ts`.
