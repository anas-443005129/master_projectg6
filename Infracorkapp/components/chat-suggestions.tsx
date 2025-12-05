"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { generateFollowUpSuggestions } from "@/app/(chat)/actions.suggestions";
import type { ChatMessage } from "@/lib/types";
import { FollowUpSuggestions } from "./follow-up-suggestions";

type ChatSuggestionsProps = {
  messages: ChatMessage[];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  isLoading: boolean;
  cloudContext?: {
    provider: string;
    scale: string;
    traffic: string;
    region: string;
  };
};

/**
 * Chat-level suggestions component that shows at the bottom of the chat
 * Only generates suggestions after assistant completes response
 * Focuses on last 2-3 exchanges to keep token usage low
 */
export function ChatSuggestions({
  messages,
  sendMessage,
  isLoading,
  cloudContext,
}: ChatSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [headline, setHeadline] = useState<string | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const lastAssistantMessageId = messages
    .filter((message) => message.role === "assistant")
    .at(-1)?.id;
  const requestCounterRef = useRef(0);
  const lastGeneratedForAssistantRef = useRef<string | null>(null);
  const previousSuggestionsRef = useRef<string[]>([]);

  // Reset suggestions when user sends a new message
  useEffect(() => {
    const lastMessage = messages.at(-1);
    if (lastMessage?.role === "user") {
      setSuggestions([]);
      setHeadline(null);
    }
  }, [messages]);

  // Generate suggestions when assistant finishes responding
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!lastAssistantMessageId) {
      return;
    }

    // Avoid regenerating for the same assistant message
    if (lastGeneratedForAssistantRef.current === lastAssistantMessageId) {
      return;
    }

    const recentMessages = messages.slice(-6);
    setSuggestionsLoading(true);
    const requestId = ++requestCounterRef.current;
    let isCancelled = false;

    generateFollowUpSuggestions(recentMessages, {
      cloudContext,
      previousSuggestions: previousSuggestionsRef.current,
    })
      .then(({ suggestions: nextSuggestions, headline: nextHeadline }) => {
        if (isCancelled || requestId !== requestCounterRef.current) {
          return;
        }
        setSuggestions(nextSuggestions);
        setHeadline(nextHeadline ?? null);
        previousSuggestionsRef.current = nextSuggestions;
        lastGeneratedForAssistantRef.current = lastAssistantMessageId;
      })
      .finally(() => {
        if (!isCancelled && requestId === requestCounterRef.current) {
          setSuggestionsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [lastAssistantMessageId, isLoading, cloudContext, messages]);

  // Don't show anything while assistant is responding
  if (isLoading) {
    return null;
  }

  // Don't show if no messages yet
  if (messages.length === 0) {
    return null;
  }

  // Show suggestions or loading state
  return (
    <FollowUpSuggestions
      headline={headline ?? undefined}
      isLoading={suggestionsLoading}
      sendMessage={sendMessage}
      suggestions={suggestions}
    />
  );
}
