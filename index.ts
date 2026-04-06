import { Agent } from "helixent/agent";
import { OpenAIModelProvider } from "helixent/community/openai";
import { defineTool, Model } from "helixent/foundation";
import { z } from "zod";

const openai = new OpenAIModelProvider({
  baseURL: process.env.ARK_BASE_URL,
  apiKey: process.env.ARK_API_KEY,
});

const model = new Model("ep-20251208110821-fnlmq", openai, {
  max_tokens: 16 * 1024,
  thinking: {
    type: "enabled",
  },
});

const agent = new Agent("weather_assistant", model, {
  prompt: "You are a weather assistant. You are given a location and you need to get the weather for that location.",
  tools: [
    defineTool({
      name: "get_weather",
      description: "Get the weather for a given location",
      parameters: z.object({
        location: z.string().describe("The location to get the weather for"),
      }),
      invoke: async ({ location }) => {
        if (location === "Tokyo") {
          return { location, weather: "sunny", temperature: { value: 20, unit: "°C", high: 25, low: 15 } };
        } else if (location === "Shanghai") {
          return { location, weather: "cloudy", temperature: { value: 22, unit: "°C", high: 26, low: 16 } };
        } else {
          return { location, weather: "rainy", temperature: { value: 18, unit: "°C", high: 23, low: 13 } };
        }
      },
    }),
  ],
});

const stream = await agent.stream({
  role: "user",
  content: [{ type: "text", text: "What's the weather in Tokyo and Shanghai?" }],
});

for await (const message of stream) {
  console.dir(message.content);
}
