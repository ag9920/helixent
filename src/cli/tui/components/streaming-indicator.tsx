import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import type { ComponentProps } from "react";

import { currentTheme } from "../themes";

const LOADING_MESSAGES = [
  "Working on it...",
  "Acting...",
  "Thinking...",
  "Processing...",
  "Working hard...",
  "Waaaaaait...",
  "Almost there...",
];

const SPINNER_TYPES = ["dots", "dots2", "dots3", "dots13", "dots8Bit", "sand", "rollingLine", "pipe", "triangle"];

export function StreamingIndicator({ streaming }: { streaming: boolean }) {
  if (!streaming) return null;
  return (
    <Box gap={1}>
      <Text color={currentTheme.colors.primary}>
        <Spinner
          type={
            SPINNER_TYPES[Math.floor(Math.random() * SPINNER_TYPES.length)] as ComponentProps<typeof Spinner>["type"]
          }
        />
        <Text> {LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]}</Text>
      </Text>
    </Box>
  );
}
