/**
 * Smart model selection logic for DevOps assistant
 * Automatically detects user intent and routes to appropriate model
 */

export type UserIntent = "code" | "plan" | "explain" | "general";

interface ModelSelection {
  intent: UserIntent;
  model: "chat-model" | "reasoning-model";
  reasoning: string;
}

const CODE_KEYWORDS = [
  "code",
  "implement",
  "build",
  "create",
  "write",
  "generate",
  "setup",
  "configure",
  "deploy",
  "install",
  "add",
  "update",
  "fix",
  "debug",
  "terraform",
  "kubernetes",
  "docker",
  "yaml",
  "manifest",
  "script",
  "pipeline",
];

const PLAN_KEYWORDS = [
  "plan",
  "design",
  "architecture",
  "strategy",
  "approach",
  "structure",
  "organize",
  "roadmap",
  "migrate",
  "scale",
  "optimize",
  "best practices",
  "how should",
  "what's the best way",
  "diagram",
  "flow",
  "infrastructure",
];

const EXPLAIN_KEYWORDS = [
  "explain",
  "what is",
  "what are",
  "how does",
  "why",
  "tell me about",
  "describe",
  "difference between",
  "compare",
  "understand",
  "clarify",
  "elaborate",
  "details",
  "help me understand",
];

/**
 * Detects user intent from the message text
 */
export function detectIntent(message: string): UserIntent {
  const lowerMessage = message.toLowerCase().trim();

  // Check for explicit prefix (from suggestions)
  if (lowerMessage.startsWith("code:")) return "code";
  if (lowerMessage.startsWith("plan:")) return "plan";
  if (lowerMessage.startsWith("explain:")) return "explain";

  // Count keyword matches
  const codeScore = CODE_KEYWORDS.filter((kw) =>
    lowerMessage.includes(kw)
  ).length;
  const planScore = PLAN_KEYWORDS.filter((kw) =>
    lowerMessage.includes(kw)
  ).length;
  const explainScore = EXPLAIN_KEYWORDS.filter((kw) =>
    lowerMessage.includes(kw)
  ).length;

  // Determine intent based on highest score
  const maxScore = Math.max(codeScore, planScore, explainScore);

  if (maxScore === 0) return "general";

  if (codeScore === maxScore) return "code";
  if (planScore === maxScore) return "plan";
  if (explainScore === maxScore) return "explain";

  return "general";
}

/**
 * Selects the appropriate model based on user intent
 * 
 * Strategy:
 * - CODE: Use chat-model (Claude 3.5 - fast, direct implementation)
 * - PLAN: Use reasoning-model (Claude 3.5 with deep thinking for architecture)
 * - EXPLAIN: Use chat-model (quick explanations)
 * - GENERAL: Use chat-model (default for conversations)
 */
export function selectModel(intent: UserIntent): ModelSelection {
  switch (intent) {
    case "code":
      return {
        intent,
        model: "chat-model",
        reasoning: "Fast implementation needed - using Claude 3.5 for direct coding",
      };
    case "plan":
      return {
        intent,
        model: "reasoning-model",
        reasoning: "Architecture/planning requires deeper thinking - using Claude 3.5 with reasoning",
      };
    case "explain":
      return {
        intent,
        model: "chat-model",
        reasoning: "Quick explanation - using Claude 3.5",
      };
    case "general":
    default:
      return {
        intent,
        model: "chat-model",
        reasoning: "General conversation - using default Claude 3.5",
      };
  }
}

/**
 * Main function to determine model based on user message
 */
export function getModelForMessage(message: string): ModelSelection {
  const intent = detectIntent(message);
  return selectModel(intent);
}
