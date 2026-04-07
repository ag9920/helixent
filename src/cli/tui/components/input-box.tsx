import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useState } from "react";

import { currentTheme } from "../themes";

const WELCOME_MESSAGES = [
  "To the moon!",
  "What do you want to build today?",
  "Hey, there!",
  "What's on your mind?",
  "Build, build, build!",
  "What's your plan today?",
  "Dream, code, repeat!",
  "Your next idea goes here...",
];

// eslint-disable-next-line no-unused-vars
export function InputBox({ disabled, onSubmit }: { disabled?: boolean; onSubmit?: (text: string) => void }) {
  const [firstMessage, setFirstMessage] = useState(true);
  const [text, setText] = useState("");
  const handleChange = (text: string) => {
    if (disabled) return;
    setText(text);
  };
  const handleSubmit = () => {
    onSubmit?.(text);
    setText("");
    setFirstMessage(false);
  };
  return (
    <Box
      borderLeft={false}
      borderRight={false}
      borderStyle="single"
      borderColor={currentTheme.colors.borderColor}
      columnGap={1}
    >
      <Text>❯</Text>
      <TextInput
        showCursor={!disabled}
        placeholder={
          firstMessage
            ? WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]
            : "Input anything to continue. Launch a new command or skill by typing `/`"
        }
        value={text}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
