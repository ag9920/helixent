import type { AssistantMessage, Message } from "../messages";
import type { Tool } from "../tools";

/**
 * A provider for a model.
 */
export interface ModelProvider {
  /**
   * Invokes the model with the given messages and options.
   * @param model - The model to invoke.
   * @param messages - The messages to send to the model.
   * @param options - The options to pass to the model.
   * @returns The response from the model.
   */
  invoke({
    // eslint-disable-next-line no-unused-vars
    model,
    // eslint-disable-next-line no-unused-vars
    messages,
    // eslint-disable-next-line no-unused-vars
    tools,
    // eslint-disable-next-line no-unused-vars
    options,
  }: {
    model: string;
    messages: Message[];
    tools?: Tool[];
    options?: Record<string, unknown>;
  }): Promise<AssistantMessage>;
}
