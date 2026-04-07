import { render } from "ink";

import type { Agent } from "@/agent";
import { createCodingAgent } from "@/coding";
import { OpenAIModelProvider } from "@/community/openai";
import { Model } from "@/foundation";

import { App } from "./tui";

let agent!: Agent;

async function setup() {
  const provider = new OpenAIModelProvider({
    baseURL: "https://ark.cn-beijing.volces.com/api/v3",
    apiKey: process.env.ARK_API_KEY,
  });

  const model = new Model(process.env.ARK_MODEL_NAME ?? "", provider, {
    max_tokens: 16 * 1024,
    thinking: {
      type: "enabled",
    },
  });

  agent = await createCodingAgent({ model });
}

function main() {
  render(<App agent={agent} />);
}

console.info();
await setup();
main();
