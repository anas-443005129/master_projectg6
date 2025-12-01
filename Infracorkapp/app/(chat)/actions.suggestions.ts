"use server";

import { generateText } from "ai";
import { myProvider } from "@/lib/ai/providers";
import type { ChatMessage } from "@/lib/types";

type CloudContext = {
  provider: string;
  scale: string;
  traffic: string;
  region: string;
};

type SuggestionOptions = {
  cloudContext?: CloudContext;
  previousSuggestions?: string[];
};

type SuggestionResult = {
  suggestions: string[];
  headline: string;
};

const suggestionPrompt = `
You are a DevOps copilot predicting the user's NEXT STEPS in their infrastructure journey.

MISSION: Generate 3-4 DIVERSE, SMART, and ACTIONABLE suggestions that anticipate what a DevOps engineer would do next.

CONTEXT ANALYSIS:
- What stage are they at? (planning → building → deploying → monitoring → optimizing)
- What's missing? (security, scaling, monitoring, automation, testing)
- What problems might arise? (downtime, costs, performance, security gaps)

SUGGESTION CATEGORIES (use appropriate prefix):
• Deploy: K8s/Docker/Terraform deployment, app rollout, infrastructure provisioning
• Setup: CI/CD pipelines, monitoring, logging, networking, databases
• Scale: Auto-scaling, load balancing, multi-region, disaster recovery
• Monitor: Dashboards, alerts, logs, metrics, observability, health checks
• Secure: Secrets management, SSL/TLS, IAM, network policies, compliance

SMART PREDICTION PATTERNS:
1. After containerization → Deploy to K8s + Setup registry + Configure networking
2. After deployment → Monitor with dashboards + Setup alerts + Add health checks
3. After basic setup → Scale with autoscaling + Secure with SSL + Optimize costs
4. After single-region → Scale to multi-region + Setup DR + Configure CDN
5. After manual process → Setup CI/CD + Automate testing + Add rollback strategy

DIVERSITY RULES:
- Mix different categories (don't suggest 3 monitoring tasks)
- Balance immediate needs vs. future improvements
- Include both tactical (quick wins) and strategic (long-term) suggestions
- Vary complexity: simple fixes + advanced optimizations

CLOUD CONTEXT AWARENESS:
- AWS: Use EKS, RDS, CloudWatch, ALB, Route53
- Azure: Use AKS, CosmosDB, Monitor, App Gateway
- GCP: Use GKE, Cloud SQL, Stackdriver, Load Balancer
- Consider scale: Small = simple setup, Large = advanced architecture

Keep suggestions under 15 words. Be specific and actionable. Think like a senior DevOps engineer.

Return ONLY a JSON array of 3-4 strings, nothing else.
`;
const fallbackPrompt = `
Return 3-4 follow-up suggestions as newline separated sentences.
Each line MUST start with one of: Deploy:, Setup:, Scale:, Monitor:, Secure:
Keep them under 15 words and tailor to the conversation focus.
`;

export async function generateFollowUpSuggestions(
  messages: ChatMessage[],
  options: SuggestionOptions = {}
): Promise<SuggestionResult> {
  const { cloudContext, previousSuggestions = [] } = options;

  const recentMessages = messages.slice(-6);
  const contextWindow = formatConversationWindow(recentMessages);
  const lastUserText = getLastUserText(recentMessages);
  const combinedText = `${contextWindow}\n\n${lastUserText}`;

  const stage = detectStage(lastUserText || contextWindow);
  const stack = detectStackFocus(combinedText);
  const focus = detectRiskFocus(combinedText);
  const headline = buildHeadline(stage, stack, focus, cloudContext);

  const previousNormalized = previousSuggestions.map(normalizeSuggestion);
  const avoidanceClause = previousNormalized.length
    ? `Avoid repeating or lightly rephrasing these previous ideas: ${previousSuggestions.join(
        " | "
      )}.`
    : "";

  let prompt = `${suggestionPrompt}\n\nSignals:\n- Phase: ${stage}\n- Stack: ${stack}\n- Focus: ${focus}`;

  if (cloudContext) {
    prompt += `\n- Cloud: ${cloudContext.provider} (${cloudContext.region}), Scale ${cloudContext.scale}, Traffic ${cloudContext.traffic}`;
  }

  if (avoidanceClause) {
    prompt += `\n\n${avoidanceClause}`;
  }

  prompt += `\n\nConversation Window:\n${contextWindow}\n\nGenerate follow-up suggestions that predict the user's NEXT DevOps step:`;

  try {
    const { text } = await generateText({
      model: myProvider.languageModel("title-model"),
      prompt,
      temperature: 0.85,
    });

    const parsed = cleanupSuggestions(
      safeParseSuggestions(text),
      previousNormalized
    );

    const freshSuggestions = parsed.slice(0, 4);

    if (freshSuggestions.length >= 3) {
      return { suggestions: freshSuggestions, headline };
    }

    const fallback = await fallbackAiSuggestions({
      contextWindow,
      stage,
      stack,
      focus,
      previousNormalized,
    });

    const merged = cleanupSuggestions(
      [...freshSuggestions, ...fallback],
      previousNormalized
    ).slice(0, 4);

    return { suggestions: merged, headline };
  } catch (error) {
    console.error("Failed to generate suggestions:", error);

    const fallback = await fallbackAiSuggestions({
      contextWindow,
      stage,
      stack,
      focus,
      previousNormalized,
    });

    return {
      suggestions: fallback.slice(0, 4),
      headline,
    };
  }
}

function formatConversationWindow(messages: ChatMessage[]): string {
  return messages
    .map((msg) => {
      const textParts = msg.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("\n");
      return `${msg.role}: ${textParts}`.trim();
    })
    .filter(Boolean)
    .join("\n\n");
}

function getLastUserText(messages: ChatMessage[]): string {
  const reversed = [...messages].reverse();
  const lastUser = reversed.find((msg) => msg.role === "user");
  if (!lastUser) {
    return "";
  }
  return lastUser.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

const stageSignals: Record<string, string[]> = {
  Planning: ["plan", "design", "architecture", "blueprint", "decide"],
  Building: ["build", "scaffold", "init", "bootstrap", "prototype"],
  Deploying: ["deploy", "release", "ship", "helm", "apply"],
  Monitoring: ["monitor", "observe", "alert", "metrics", "logging"],
  Optimizing: ["optimize", "cost", "perf", "latency", "refine", "scale"],
};

function detectStage(text: string): string {
  const lower = text?.toLowerCase() ?? "";
  for (const [stage, keywords] of Object.entries(stageSignals)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return stage;
    }
  }
  return "Exploration";
}

const stackSignals = [
  { label: "Kubernetes", keywords: ["k8s", "kubernetes", "helm", "ingress", "cluster"] },
  { label: "Terraform", keywords: ["terraform", "tfvars", "hcl"] },
  { label: "Serverless", keywords: ["lambda", "functions", "cloud functions"] },
  { label: "CI/CD", keywords: ["pipeline", "github actions", "argo", "tekton", "azure devops"] },
  { label: "Observability", keywords: ["prometheus", "grafana", "datadog", "logs", "traces"] },
  { label: "Data", keywords: ["postgres", "redis", "database", "storage"] },
];

function detectStackFocus(text: string): string {
  const lower = text?.toLowerCase() ?? "";
  const matches = stackSignals
    .filter((signal) => signal.keywords.some((keyword) => lower.includes(keyword)))
    .map((signal) => signal.label);

  if (matches.length === 0) {
    return "General DevOps";
  }

  return matches.slice(0, 2).join(" + ");
}

const riskSignals = [
  { label: "Security hardening", keywords: ["security", "iam", "secrets", "tls", "compliance"] },
  { label: "Performance", keywords: ["latency", "throughput", "performance", "slowness"] },
  { label: "Resilience", keywords: ["dr", "failover", "resilience", "uptime", "outage"] },
  { label: "Cost", keywords: ["cost", "budget", "spend", "price"] },
];

function detectRiskFocus(text: string): string {
  const lower = text?.toLowerCase() ?? "";
  const focus = riskSignals.find((signal) =>
    signal.keywords.some((keyword) => lower.includes(keyword))
  );

  return focus?.label ?? "Balanced readiness";
}

function buildHeadline(
  stage: string,
  stack: string,
  focus: string,
  cloudContext?: CloudContext
): string {
  const parts: string[] = [];
  if (cloudContext?.provider) {
    parts.push(`${cloudContext.provider} workload`);
  }
  parts.push(`${stage} phase`);
  if (stack && stack !== "General DevOps") {
    parts.push(stack);
  }
  if (focus && focus !== "Balanced readiness") {
    parts.push(`Focus: ${focus}`);
  }
  return parts.join(" · ") || "Next best actions";
}

function safeParseSuggestions(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
  } catch (error) {
    // Try to recover array substring
    const start = trimmed.indexOf("[");
    const end = trimmed.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        const parsed = JSON.parse(trimmed.slice(start, end + 1));
        if (Array.isArray(parsed)) {
          return parsed.map(String);
        }
      } catch {
        // ignore
      }
    }
    console.warn("Unable to parse suggestions as JSON", error);
  }

  return [];
}

function normalizeSuggestion(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function cleanupSuggestions(
  suggestions: string[],
  previousNormalized: string[]
): string[] {
  const seen = new Set<string>();

  return suggestions
    .map((suggestion) => suggestion.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((suggestion) =>
      /^(deploy|setup|scale|monitor|secure):/i.test(suggestion)
        ? suggestion
        : `Deploy: ${suggestion}`
    )
    .filter((suggestion) => {
      const normalized = normalizeSuggestion(suggestion);
      if (seen.has(normalized)) {
        return false;
      }
      if (previousNormalized.includes(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
}

async function fallbackAiSuggestions({
  contextWindow,
  stage,
  stack,
  focus,
  previousNormalized,
}: {
  contextWindow: string;
  stage: string;
  stack: string;
  focus: string;
  previousNormalized: string[];
}): Promise<string[]> {
  const prompt = `${fallbackPrompt}\n\nPhase: ${stage}\nStack: ${stack}\nFocus: ${focus}\n\nConversation Window:\n${contextWindow}`;

  const { text } = await generateText({
    model: myProvider.languageModel("title-model"),
    prompt,
    temperature: 0.95,
  });

  const raw = text
    .split(/\n+/)
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean);

  return cleanupSuggestions(raw, previousNormalized);
}
