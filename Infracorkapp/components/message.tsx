"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { CanvasCard, type CanvasCard as CanvasCardType } from "./canvas-card";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";
import { MessageContent } from "./elements/message";
import { Response } from "./elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./elements/tool";
import { SparklesIcon } from "./icons";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

function classifyCodeBlock(
  language: string,
  content: string
): { title: string; type: CanvasCardType["type"] } {
  const lang = language.toLowerCase();
  const loweredContent = content.toLowerCase();

  if (lang === "terraform" || loweredContent.includes('resource "aws_')) {
    return { title: "Terraform Infrastructure", type: "architecture" };
  }

  if (
    (lang === "yaml" || lang === "yml") &&
    (loweredContent.includes("apiversion") || loweredContent.includes("kind:"))
  ) {
    return { title: "Kubernetes Manifest", type: "config" };
  }

  if (lang.includes("docker")) {
    return { title: "Dockerfile", type: "config" };
  }

  if (lang === "json" && loweredContent.includes("pricing")) {
    return { title: "Pricing Structure", type: "pricing" };
  }

  if (lang === "json" && /"?resources"?\s*:/i.test(content)) {
    return { title: "CloudFormation Template", type: "architecture" };
  }

  if (lang === "bash" || lang === "sh") {
    return { title: "Deployment Script", type: "code" };
  }

  return { title: "Code Snippet", type: "code" };
}

// Helper function to extract canvas cards from message text
function extractCanvasCards(text: string): {
  cards: CanvasCardType[];
  cleanText: string;
} {
  const cards: CanvasCardType[] = [];
  let workingText = text;

  // Extract substantial code blocks into canvas cards
  const codeBlockPattern = /```(\w+)?[^\n]*\n([\s\S]*?)```/g;
  const codeMatches = [...text.matchAll(codeBlockPattern)];

  codeMatches.forEach((match, index) => {
    const language = match[1] || "text";
    const content = match[2].trim();

    if (content.length < 60) {
      return;
    }

    const meta = classifyCodeBlock(language, content);

    cards.push({
      id: `code-${index}`,
      title: meta.title,
      type: meta.type,
      content,
      language,
    });

    workingText = workingText.replace(match[0], "");
  });

  // Extract guides/runbooks (sections with headings + steps)
  const guidePattern = /(##+\s+[^\n]+)\n([\s\S]*?)(?=(?:\n##+\s+)|$)/g;
  const guideMatches = [...workingText.matchAll(guidePattern)];

  guideMatches.forEach((match, index) => {
    const heading = match[1]?.replace(/^#+\s*/, "").trim();
    const body = match[2]?.trim() ?? "";

    if (!heading || body.length < 50) {
      return;
    }

    const bulletCount = (body.match(/^(?:-|\d+\.)/gm) ?? []).length;
    const guideKeywords = [
      "guide",
      "runbook",
      "checklist",
      "playbook",
      "procedure",
      "steps",
      "plan",
    ];
    const looksLikeGuide =
      bulletCount >= 2 ||
      guideKeywords.some((keyword) => heading.toLowerCase().includes(keyword));

    if (!looksLikeGuide) {
      return;
    }

    cards.push({
      id: `guide-${index}`,
      title: heading,
      type: "guide",
      content: `${heading}\n${body}`,
    });

    workingText = workingText.replace(match[0], "");
  });

  const cleanText = workingText.replace(/\n{3,}/g, "\n\n").trim();

  return { cards, cleanText };
}

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
  sendMessage,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
  sendMessage?: UseChatHelpers<ChatMessage>["sendMessage"];
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={message.role}
      data-testid={`message-${message.role}`}
      initial={{ opacity: 0 }}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <div className="-mt-1 gradient-primary glow-green pulse-glow flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg">
            <SparklesIcon size={16} />
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.parts?.some(
              (p) => p.type === "text" && p.text?.trim()
            ),
            "min-h-96": message.role === "assistant" && requiresScrollPadding,
            "w-full":
              (message.role === "assistant" &&
                message.parts?.some(
                  (p) => p.type === "text" && p.text?.trim()
                )) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
          {attachmentsFromMessage.length > 0 && (
            <div
              className="flex flex-row justify-end gap-2"
              data-testid={"message-attachments"}
            >
              {attachmentsFromMessage.map((attachment) => (
                <PreviewAttachment
                  attachment={{
                    name: attachment.filename ?? "file",
                    contentType: attachment.mediaType,
                    url: attachment.url,
                  }}
                  key={attachment.url}
                />
              ))}
            </div>
          )}

          {message.parts?.map((part, index) => {
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            if (type === "reasoning" && part.text?.trim().length > 0) {
              return (
                <MessageReasoning
                  isLoading={isLoading}
                  key={key}
                  reasoning={part.text}
                />
              );
            }

            if (type === "text") {
              if (mode === "view") {
                const { cards, cleanText } =
                  message.role === "assistant"
                    ? extractCanvasCards(part.text)
                    : { cards: [], cleanText: part.text };

                const textToRender =
                  message.role === "assistant" ? cleanText : part.text;

                const hasRenderableText = Boolean(textToRender?.trim().length);

                return (
                  <div className="flex w-full flex-col gap-3" key={key}>
                    {hasRenderableText && (
                      <MessageContent
                        className={cn({
                          "wrap-break-word glass-card dark:glass-card-dark w-fit rounded-2xl border border-primary/20 px-4 py-3 text-right":
                            message.role === "user",
                          "bg-transparent px-0 py-0 text-left":
                            message.role === "assistant",
                        })}
                        data-testid="message-content"
                      >
                        <Response>{sanitizeText(textToRender)}</Response>
                      </MessageContent>
                    )}

                    {cards.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {cards.map((card) => (
                          <CanvasCard card={card} key={card.id} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (mode === "edit") {
                return (
                  <div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                  >
                    <div className="size-8" />
                    <div className="min-w-0 flex-1">
                      <MessageEditor
                        key={message.id}
                        message={message}
                        regenerate={regenerate}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </div>
                );
              }
            }

            if (type === "tool-getWeather") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-getWeather" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={<Weather weatherAtLocation={part.output} />}
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-createDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error creating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <DocumentPreview
                  isReadonly={isReadonly}
                  key={toolCallId}
                  result={part.output}
                />
              );
            }

            if (type === "tool-updateDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error updating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <div className="relative" key={toolCallId}>
                  <DocumentPreview
                    args={{ ...part.output, isUpdate: true }}
                    isReadonly={isReadonly}
                    result={part.output}
                  />
                </div>
              );
            }

            if (type === "tool-requestSuggestions") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-requestSuggestions" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={
                          "error" in part.output ? (
                            <div className="rounded border p-2 text-red-500">
                              Error: {String(part.output.error)}
                            </div>
                          ) : (
                            <DocumentToolResult
                              isReadonly={isReadonly}
                              result={part.output}
                              type="request-suggestions"
                            />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            return null;
          })}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              vote={vote}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }
    if (prevProps.message.id !== nextProps.message.id) {
      return false;
    }
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding) {
      return false;
    }
    if (!equal(prevProps.message.parts, nextProps.message.parts)) {
      return false;
    }
    if (!equal(prevProps.vote, nextProps.vote)) {
      return false;
    }
    return false;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={role}
      data-testid="message-assistant-loading"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-start gap-3">
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="p-0 text-muted-foreground text-sm">Thinking...</div>
        </div>
      </div>
    </motion.div>
  );
};
