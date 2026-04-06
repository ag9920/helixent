import type {
  AssistantMessage,
  Model,
  NonSystemMessage,
  Tool,
  ToolMessage,
  ToolUseContent,
  UserMessage,
} from "@/foundation";

/**
 * A context that is used to invoke a React agent.
 */
export interface AgentContext {
  /** The system prompt to use to invoke the agent. */
  prompt?: string;
  /** The tools to use to invoke the agent. */
  tools?: Tool[];
  /** The messages to use to invoke the agent. */
  messages?: NonSystemMessage[];
}

/**
 * The options for the ReactAgent.
 */
export interface AgentOptions {
  /** The maximum number of steps to take. */
  maxSteps?: number;
}

/**
 * An agent loop that uses the ReAct pattern to reason about and execute actions.
 * @param name - The name of the agent.
 * @param model - The model to use to invoke the agent.
 * @param context - The context of the agent.
 * @param options - The options for the agent.
 */
export class Agent {
  private readonly _context: Required<AgentContext>;

  readonly options: Required<AgentOptions>;

  private stringifyToolResult(result: unknown): string {
    if (result === undefined) return "undefined";
    if (result === null) return "null";
    if (typeof result === "object") return JSON.stringify(result);
    return String(result);
  }

  /**
   * Creates a new agent.
   * @param name - The name of the agent.
   * @param model - The model to use to invoke the agent.
   * @param context - The context of the agent.
   * @param options - The options for the agent.
   */
  constructor(
    // eslint-disable-next-line no-unused-vars
    readonly name: string,
    // eslint-disable-next-line no-unused-vars
    readonly model: Model,
    context: AgentContext & { messages?: NonSystemMessage[] } = { messages: [] },
    { maxSteps = 25 }: AgentOptions = {},
  ) {
    if (!context.messages) {
      context.messages = [];
    }
    this._context = context as Required<AgentContext>;
    this.options = { maxSteps };
  }

  /**
   * Gets the messages for the agent.
   */
  get messages() {
    return this._context.messages;
  }

  /**
   * Gets or sets the prompt for the agent.
   */
  get prompt() {
    return this._context.prompt;
  }
  set prompt(prompt: string) {
    this._context.prompt = prompt;
  }

  /**
   * Gets the tools for the agent.
   */
  get tools() {
    return this._context.tools;
  }

  /**
   * Runs the agent.
   * @param message - The message to send to the agent.
   * @returns The response from the agent. If the agent ran successfully, the response will be the final response from the agent. If the agent stopped running due to a maximum number of steps being reached, the response will be the last response from the agent.
   */
  async *stream(message: UserMessage): AsyncGenerator<AssistantMessage | ToolMessage> {
    let steps = 0;
    let assistantMessage: AssistantMessage | undefined;
    this._appendMessage(message);
    while (true) {
      steps++;
      if (steps > this.options.maxSteps) {
        throw new Error("Maximum number of steps reached");
      }

      assistantMessage = await this.model.invoke({
        prompt: this.prompt,
        messages: this.messages,
        tools: this.tools,
      });
      this._appendMessage(assistantMessage);
      yield assistantMessage;

      if (assistantMessage.content.some((content) => content.type === "tool_use")) {
        // If there are tool calls, the agent needs to invoke the tools in parallel.
        const toolCalls = assistantMessage.content
          .filter((content) => content.type === "tool_use")
          .map((content) => {
            const toolUse = content as ToolUseContent;
            const tool = this.tools?.find((t) => t.name === toolUse.name);
            return { toolUse, tool };
          })
          .filter(({ tool }) => Boolean(tool)) as Array<{ toolUse: ToolUseContent; tool: Tool }>;

        const toolResults = await Promise.all(
          toolCalls.map(async ({ toolUse, tool }) => ({
            toolUse,
            resultString: this.stringifyToolResult(await tool.invoke(toolUse.input)),
          })),
        );

        for (const { toolUse, resultString } of toolResults) {
          const toolMessage: ToolMessage = {
            role: "tool",
            content: [
              {
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: resultString,
              },
            ],
          };
          this._appendMessage(toolMessage);
          yield toolMessage;
        }
      } else {
        // If no tool calls, the agent has finished its work.
        break;
      }
    }
  }

  private _appendMessage(message: NonSystemMessage) {
    this.messages.push(message);
  }
}
