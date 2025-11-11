"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo } from "react";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "./elements/suggestion";

type FollowUpSuggestionsProps = {
  suggestions: string[];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
};

function PureFollowUpSuggestions({
  suggestions,
  sendMessage,
}: FollowUpSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex w-full flex-col gap-2">
      <div className="text-muted-foreground text-xs font-medium">
        Follow-up questions:
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            key={suggestion}
            transition={{ delay: 0.05 * index }}
          >
            <Suggestion
              className="h-auto whitespace-normal rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs hover:bg-muted"
              onClick={(text) => {
                sendMessage({
                  role: "user",
                  parts: [{ type: "text", text }],
                });
              }}
              suggestion={suggestion}
            >
              {suggestion}
            </Suggestion>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const FollowUpSuggestions = memo(PureFollowUpSuggestions);
