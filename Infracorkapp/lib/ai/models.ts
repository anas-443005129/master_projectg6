export const DEFAULT_CHAT_MODEL: string = "auto";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
  badge?: string;
  pricing?: "cheap" | "moderate" | "expensive";
};

export const chatModels: ChatModel[] = [
  {
    id: "auto",
    name: "🤖 Auto (Recommended)",
    description: "Smart mode - automatically picks the best model for your task",
    badge: "Smart",
  },
  {
    id: "chat-model",
    name: "Claude 3.5 Sonnet",
    description: "Best for: Coding, implementation, fast responses",
    badge: "Fast",
    pricing: "moderate",
  },
  {
    id: "reasoning-model",
    name: "Claude 3.5 Sonnet (Deep Think)",
    description: "Best for: Architecture, complex planning, deep reasoning",
    badge: "Smart",
    pricing: "expensive",
  },
  {
    id: "fast-model",
    name: "GPT-4o Mini",
    description: "Best for: Quick tasks, explanations, cost-effective",
    badge: "Budget",
    pricing: "cheap",
  },
  {
    id: "vision-model",
    name: "GPT-4o",
    description: "Best for: Image analysis, diagrams, multimodal tasks",
    badge: "Vision",
    pricing: "expensive",
  },
  {
    id: "gemini-model",
    name: "Gemini 2.0 Flash",
    description: "Best for: Long context, large codebases, ultra-fast",
    badge: "Flash",
    pricing: "cheap",
  },
];
