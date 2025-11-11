"use client";

import { useState } from "react";
import { CheckCircleFillIcon, CodeIcon, CopyIcon, FileIcon } from "./icons";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

export type CanvasCard = {
  id: string;
  title: string;
  type: "code" | "pricing" | "architecture" | "config";
  content: string;
  language?: string;
};

type CanvasCardProps = {
  card: CanvasCard;
};

export function CanvasCard({ card }: CanvasCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(card.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getIcon = () => {
    switch (card.type) {
      case "code":
      case "config":
        return <CodeIcon size={16} />;
      case "pricing":
      case "architecture":
        return <FileIcon size={16} />;
      default:
        return <FileIcon size={16} />;
    }
  };

  const getTypeLabel = () => {
    switch (card.type) {
      case "code":
        return "Code";
      case "pricing":
        return "Pricing";
      case "architecture":
        return "Architecture";
      case "config":
        return "Configuration";
      default:
        return "Document";
    }
  };

  return (
    <>
      <button
        className="group flex w-full max-w-md flex-row items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 text-left transition-all hover:border-muted-foreground/30 hover:bg-muted/50"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-border group-hover:ring-muted-foreground/30">
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-sm">{card.title}</div>
          <div className="text-muted-foreground text-xs">{getTypeLabel()}</div>
        </div>
        <div className="text-muted-foreground text-xs">View →</div>
      </button>

      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <SheetContent className="w-full overflow-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {getIcon()}
              {card.title}
            </SheetTitle>
          </SheetHeader>
          <div className="relative mt-4 flex-1">
            <div className="mb-2 flex justify-end">
              <Button
                className="h-8 gap-2"
                onClick={handleCopy}
                size="sm"
                variant="secondary"
              >
                {isCopied ? (
                  <>
                    <CheckCircleFillIcon size={14} />
                    Copied
                  </>
                ) : (
                  <>
                    <CopyIcon size={14} />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-xs">
              <code className={card.language ? `language-${card.language}` : ""}>
                {card.content}
              </code>
            </pre>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
