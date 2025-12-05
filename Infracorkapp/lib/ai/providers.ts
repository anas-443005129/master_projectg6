import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "auto": chatModel, // Auto defaults to chat-model in tests
          "chat-model": chatModel,
          "reasoning-model": reasoningModel,
          "fast-model": chatModel,
          "vision-model": chatModel,
          "gemini-model": chatModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        // Auto mode - defaults to Claude 3.5 (will be overridden by smart selection)
        "auto": gateway.languageModel("anthropic/claude-3-5-sonnet-20241022"),
        
        // Claude 3.5 Sonnet - Fast coding and implementation
        "chat-model": gateway.languageModel("anthropic/claude-3-5-sonnet-20241022"),
        
        // Claude 3.5 Sonnet with reasoning - Deep thinking for architecture
        "reasoning-model": wrapLanguageModel({
          model: gateway.languageModel("anthropic/claude-3-5-sonnet-20241022"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        
        // GPT-4o Mini - Budget friendly and fast
        "fast-model": gateway.languageModel("openai/gpt-4o-mini"),
        
        // GPT-4o - Vision and multimodal
        "vision-model": gateway.languageModel("openai/gpt-4o"),
        
        // Gemini 2.0 Flash - Long context and ultra-fast
        "gemini-model": gateway.languageModel("google/gemini-2.0-flash-exp"),
        
        // Small models for title and artifact generation
        "title-model": gateway.languageModel("openai/gpt-4o-mini"),
        "artifact-model": gateway.languageModel("openai/gpt-4o-mini"),
      },
    });
