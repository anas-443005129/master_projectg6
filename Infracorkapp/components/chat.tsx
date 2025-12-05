"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { ChatHeader } from "@/components/chat-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import type { Vote } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { guestRegex } from "@/lib/constants";
import type { Attachment, ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { Artifact } from "./artifact";
import { ChatSuggestions } from "./chat-suggestions";
import { useDataStream } from "./data-stream-provider";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import { toast } from "./toast";
import { Button } from "./ui/button";
import type { VisibilityType } from "./visibility-selector";

const GUEST_PROMPT_LIMIT = 3;

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  initialLastContext,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: AppUsage;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { data: session } = useSession();

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>("");
  const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);
  const [cloudContext, setCloudContext] = useState({
    provider: "AWS",
    scale: "Small (<1k users/day)",
    traffic: "Steady",
    region: "US East",
  });
  const cloudContextRef = useRef(cloudContext);

  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  useEffect(() => {
    cloudContextRef.current = cloudContext;
  }, [cloudContext]);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        return {
          body: {
            id: request.id,
            message: request.messages.at(-1),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            cloudContext: cloudContextRef.current,
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
      if (dataPart.type === "data-usage") {
        setUsage(dataPart.data);
      }
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        // Check if it's a credit card error
        if (
          error.message?.includes("AI Gateway requires a valid credit card")
        ) {
          setShowCreditCardAlert(true);
        } else {
          toast({
            type: "error",
            description: error.message,
          });
        }
      }
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Vote[]>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  const guestPromptCount = useMemo(() => {
    return messages.filter((message) => message.role === "user").length;
  }, [messages]);

  const isGuestUser = guestRegex.test(session?.user?.email ?? "");
  const guestLimitReached =
    isGuestUser && guestPromptCount >= GUEST_PROMPT_LIMIT;

  const tokenLimitState = useMemo(() => {
    const limit =
      usage?.context?.totalMax ??
      usage?.context?.combinedMax ??
      usage?.context?.inputMax;

    if (!limit || !Number.isFinite(limit) || limit <= 0) {
      return {
        reached: false,
        used: usage?.totalTokens ?? 0,
        limit: undefined,
      };
    }

    const used = usage?.totalTokens ?? 0;
    return {
      reached: used >= limit,
      used,
      limit,
    };
  }, [usage]);

  const tokenLimitReached = tokenLimitState.reached;
  const loginHref = `/login?redirect=/chat/${id}`;
  const signupHref = `/register?redirect=/chat/${id}`;
  const subscribeHref = "/#pricing";

  const shouldShowSuggestions =
    !guestLimitReached &&
    !tokenLimitReached &&
    !isReadonly &&
    Boolean(sendMessage);

  const bottomAccessory =
    guestLimitReached || tokenLimitReached || shouldShowSuggestions ? (
      <div className="flex flex-col gap-3">
        {guestLimitReached && (
          <LimitNotice
            badge="Guest"
            description="You’ve used all 3 free guest prompts. Create an account to unlock better, longer responses."
            primaryHref={loginHref}
            primaryLabel="Login"
            secondaryHref={signupHref}
            secondaryLabel="Create account"
            title="Keep the conversation going"
          />
        )}

        {tokenLimitReached && (
          <LimitNotice
            badge="Context"
            description="This chat has reached the current token allowance. Subscribe to upgrade your limits and resume chatting."
            primaryHref={subscribeHref}
            primaryLabel="Subscribe"
            title="Need more runway?"
          />
        )}

        {shouldShowSuggestions && sendMessage && (
          <ChatSuggestions
            cloudContext={cloudContext}
            isLoading={status === "streaming"}
            messages={messages}
            sendMessage={sendMessage}
          />
        )}
      </div>
    ) : null;

  return (
    <>
      <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
        <ChatHeader
          chatId={id}
          isReadonly={isReadonly}
          selectedVisibilityType={initialVisibilityType}
        />

        <Messages
          chatId={id}
          bottomAccessory={bottomAccessory}
          isArtifactVisible={isArtifactVisible}
          isReadonly={isReadonly}
          messages={messages}
          regenerate={regenerate}
          selectedModelId={initialChatModel}
          sendMessage={sendMessage}
          setMessages={setMessages}
          status={status}
          votes={votes}
        />

        <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl flex-col gap-3 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
          {!isReadonly && (
            <MultimodalInput
              guestLimitReached={guestLimitReached}
              guestPromptCount={guestPromptCount}
              guestPromptLimit={GUEST_PROMPT_LIMIT}
              attachments={attachments}
              chatId={id}
              input={input}
              loginHref={loginHref}
              messages={messages}
              onCloudContextChange={setCloudContext}
              onModelChange={setCurrentModelId}
              subscribeHref={subscribeHref}
              tokenLimitReached={tokenLimitReached}
              selectedModelId={currentModelId}
              selectedVisibilityType={visibilityType}
              sendMessage={sendMessage}
              setAttachments={setAttachments}
              setInput={setInput}
              setMessages={setMessages}
              status={status}
              stop={stop}
              usage={usage}
            />
          )}
        </div>
      </div>

      <Artifact
        attachments={attachments}
        chatId={id}
        input={input}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedModelId={currentModelId}
        selectedVisibilityType={visibilityType}
        sendMessage={sendMessage}
        setAttachments={setAttachments}
        setInput={setInput}
        setMessages={setMessages}
        status={status}
        stop={stop}
        votes={votes}
      />

      <AlertDialog
        onOpenChange={setShowCreditCardAlert}
        open={showCreditCardAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              This application requires{" "}
              {process.env.NODE_ENV === "production" ? "the owner" : "you"} to
              activate Vercel AI Gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open(
                  "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
                  "_blank"
                );
                window.location.href = "/";
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type LimitNoticeProps = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  badge?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

function LimitNotice({
  title,
  description,
  primaryHref,
  primaryLabel,
  badge,
  secondaryHref,
  secondaryLabel,
}: LimitNoticeProps) {
  return (
    <div className="glass dark:glass-dark w-full rounded-2xl border border-primary/20 p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          {badge && (
            <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {badge}
            </span>
          )}
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-muted-foreground text-sm leading-5">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <a href={primaryHref}>{primaryLabel}</a>
          </Button>
          {secondaryHref && secondaryLabel ? (
            <Button asChild size="sm" variant="outline">
              <a href={secondaryHref}>{secondaryLabel}</a>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
