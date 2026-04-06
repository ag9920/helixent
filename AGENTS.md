## Helixent

Helixent is a small library for building **ReAct-style** agent loops on the **Bun** stack.

This project is organized into **four layers**, plus a separate `community` area for third-party integrations.

## Architecture (4 layers)

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

This layer should depend only on `foundation`, and remain generic (not coding-specific).

### 3) `coding-agent`

A domain-specific agent built on the ReAct loop:

- Specializes the base agent behavior for **software engineering workflows** (e.g. reading files, proposing edits, running checks).
- Defines the coding-focused policy around tool usage, safety constraints, and output shape.

This layer should build on `agent` + `foundation`, without leaking CLI concerns.

### 4) `cli`

The command-line interface:

- Parses command-line arguments and environment variables.
- Wires up a model provider, selects an agent (e.g. coding agent), and runs the loop.
- Handles UX concerns like streaming, logging, and exit codes.

This layer should be the only place that is “terminal product” specific.

## `community` (external)

`community` contains **third-party integrations** that are maintained separately from the core layering above.

Guidelines:

- Treat it as optional and decoupled; avoid coupling `foundation`/`agent` to integrations.
- Prefer adapters that implement existing `foundation` interfaces instead of changing core types.

## Stack

- **Runtime / package manager**: [Bun](https://bun.com)
- **Language**: TypeScript (strict, `moduleResolution: "bundler"`)

## Imports

- **Library entry**: `import { … } from "helixent"` (maps to `./src` via `tsconfig` `paths`)
- **Internal**: `@/…` maps to `./src/…`

## Conventions

- Keep comments minimal and intent-focused.
- Avoid drive-by refactors outside the task at hand.
- Provider options: `OpenAIModelProvider` merges `options` into `chat.completions.create` (e.g. provider-specific flags); defaults include `temperature: 0`, `top_p: 0`, and a `max_tokens` cap.

## Commands

```bash
bun install
bun run dev
bun run check
bun run lint
bun run lint:fix
bun run build:js
bun run build:bin
```

Environment variables used by the sample root `index.ts` are provider-specific (e.g. `ARK_BASE_URL`, `ARK_API_KEY` for an OpenAI-compatible endpoint).

## Quality gate

Run `bun run check` as the main gate (`tsc --noEmit` + ESLint). Use `bun run check:types` for type-check-only validation.
