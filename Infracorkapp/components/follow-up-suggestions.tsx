"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import {
  Code2Icon,
  LightbulbIcon,
  MessageCircleQuestionIcon,
  SparklesIcon,
} from "lucide-react";
import { memo } from "react";
import type { ChatMessage } from "@/lib/types";

type FollowUpSuggestionsProps = {
  suggestions: string[];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  isLoading?: boolean;
  headline?: string;
};

function getActionIcon(suggestion: string) {
  if (suggestion.startsWith("Deploy:")) {
    return <Code2Icon className="size-3.5" />;
  }
  if (suggestion.startsWith("Setup:")) {
    return <LightbulbIcon className="size-3.5" />;
  }
  if (suggestion.startsWith("Scale:")) {
    return <SparklesIcon className="size-3.5" />;
  }
  if (suggestion.startsWith("Monitor:")) {
    return <MessageCircleQuestionIcon className="size-3.5" />;
  }
  if (suggestion.startsWith("Secure:")) {
    return <Code2Icon className="size-3.5" />;
  }
  return <SparklesIcon className="size-3.5" />;
}

function getActionColor(suggestion: string) {
  if (suggestion.startsWith("Deploy:")) {
    return "text-emerald-500 dark:text-emerald-400";
  }
  if (suggestion.startsWith("Setup:")) {
    return "text-blue-500 dark:text-blue-400";
  }
  if (suggestion.startsWith("Scale:")) {
    return "text-purple-500 dark:text-purple-400";
  }
  if (suggestion.startsWith("Monitor:")) {
    return "text-amber-500 dark:text-amber-400";
  }
  if (suggestion.startsWith("Secure:")) {
    return "text-red-500 dark:text-red-400";
  }
  return "text-primary";
}

function PureFollowUpSuggestions({
  suggestions,
  sendMessage,
  isLoading = false,
  headline,
}: FollowUpSuggestionsProps) {
  if (!isLoading && suggestions.length === 0) {
    return null;
  }

  const headingCopy = isLoading
    ? "Generating next moves..."
    : headline ?? "Fresh AI directions";

  return (
    <div className="mt-5 flex w-full flex-col gap-3">
      <div className="flex items-center gap-2 font-semibold text-gradient text-sm">
        <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
        {headingCopy}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {isLoading
          ? // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                className="glass dark:glass-dark h-9 rounded-full border border-primary/30 px-4"
                initial={{ opacity: 0.4 }}
                key={index}
                style={{ width: `${120 + index * 20}px` }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.1 * index,
                }}
              />
            ))
          : suggestions.map((suggestion, index) => (
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
                  <span className={getActionColor(suggestion)}>
                    {getActionIcon(suggestion)}
                  </span>
                  {suggestion}
                </span>
              </motion.button>
            ))}
      </div>
    </div>
  );
}

export const FollowUpSuggestions = memo(PureFollowUpSuggestions);
