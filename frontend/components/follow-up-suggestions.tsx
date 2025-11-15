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
    <div className="mt-5 flex w-full flex-col gap-3">
      <div className="text-gradient text-sm font-semibold flex items-center gap-2">
        <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
        Continue the conversation
      </div>
      <div className="flex flex-wrap gap-2.5">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-all glass dark:glass-dark border border-primary/30 hover-lift"
            onClick={() => {
              sendMessage({
                role: "user",
                parts: [{ type: "text", text: suggestion }],
              });
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shimmer" />
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-primary">→</span>
              {suggestion}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export const FollowUpSuggestions = memo(PureFollowUpSuggestions);
