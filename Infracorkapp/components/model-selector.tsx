"use client";

import type { Session } from "next-auth";
import { startTransition, useMemo, useOptimistic, useState } from "react";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { chatModels } from "@/lib/ai/models";
import { cn } from "@/lib/utils";
import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";

export function ModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: Session;
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const userType = session.user.type;
  const { availableChatModelIds } = entitlementsByUserType[userType];

  const availableChatModels = chatModels.filter((chatModel) =>
    availableChatModelIds.includes(chatModel.id)
  );

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId
      ),
    [optimisticModelId, availableChatModels]
  );

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          className="md:h-[34px] md:px-2"
          data-testid="model-selector"
          variant="outline"
        >
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[280px] max-w-[90vw] sm:min-w-[300px]"
      >
        {availableChatModels.map((chatModel) => {
          const { id } = chatModel;

          return (
            <DropdownMenuItem
              asChild
              data-active={id === optimisticModelId}
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setOpen(false);

                startTransition(() => {
                  setOptimisticModelId(id);
                  saveChatModelAsCookie(id);
                });
              }}
            >
              <button
                className="group/item flex w-full flex-row items-center justify-between gap-2 sm:gap-4"
                type="button"
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base">
                      {chatModel.name}
                    </span>
                    {chatModel.badge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          chatModel.badge === "Smart" &&
                            "bg-purple-500/20 text-purple-700 dark:text-purple-300",
                          chatModel.badge === "Fast" &&
                            "bg-blue-500/20 text-blue-700 dark:text-blue-300",
                          chatModel.badge === "Budget" &&
                            "bg-green-500/20 text-green-700 dark:text-green-300",
                          chatModel.badge === "Vision" &&
                            "bg-amber-500/20 text-amber-700 dark:text-amber-300",
                          chatModel.badge === "Flash" &&
                            "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300"
                        )}
                      >
                        {chatModel.badge}
                      </span>
                    )}
                    {chatModel.pricing && (
                      <span
                        className={cn(
                          "text-[10px]",
                          chatModel.pricing === "cheap" &&
                            "text-green-600 dark:text-green-400",
                          chatModel.pricing === "moderate" &&
                            "text-amber-600 dark:text-amber-400",
                          chatModel.pricing === "expensive" &&
                            "text-red-600 dark:text-red-400"
                        )}
                      >
                        {chatModel.pricing === "cheap" && "💰"}
                        {chatModel.pricing === "moderate" && "💰💰"}
                        {chatModel.pricing === "expensive" && "💰💰💰"}
                      </span>
                    )}
                  </div>
                  <div className="line-clamp-2 text-muted-foreground text-xs">
                    {chatModel.description}
                  </div>
                </div>

                <div className="shrink-0 text-foreground opacity-0 group-data-[active=true]/item:opacity-100 dark:text-foreground">
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
