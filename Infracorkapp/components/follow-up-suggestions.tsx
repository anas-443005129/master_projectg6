"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo } from "react";
import type { ChatMessage } from "@/lib/types";

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
      <div className="flex items-center gap-2 font-semibold text-gradient text-sm">
        <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
        Continue the conversation
      </div>
      <div className="flex flex-wrap gap-2.5">
        {suggestions.map((suggestion, index) => (
          <motion.button
            animate={{ opacity: 1, scale: 1 }}
            className="group glass dark:glass-dark hover-lift relative overflow-hidden rounded-full border border-primary/30 px-4 py-2 font-medium text-sm transition-all"
            initial={{ opacity: 0, scale: 0.9 }}
            key={suggestion}
            onClick={() => {
              sendMessage({
                role: "user",
                parts: [{ type: "text", text: suggestion }],
              });
            }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="shimmer absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
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
