"use client";

import { useState } from "react";
import { CheckCircleFillIcon, CodeIcon, CopyIcon, FileIcon } from "./icons";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

export type CanvasCard = {
  id: string;
  title: string;
  type: "code" | "pricing" | "architecture" | "config" | "guide";
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
      case "guide":
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
      case "guide":
        return "Runbook";
      default:
        return "Document";
    }
  };

  return (
    <>
      <button
        className="group glass-card dark:glass-card-dark hover-lift animated-border flex w-full max-w-md flex-row items-center gap-3 rounded-xl p-4 text-left transition-all"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <div className="gradient-primary flex size-12 shrink-0 items-center justify-center rounded-lg text-white shadow-lg">
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-sm">{card.title}</div>
          <div className="font-medium text-muted-foreground text-xs">
            {getTypeLabel()}
          </div>
        </div>
        <div className="font-medium text-primary text-sm">View →</div>
      </button>

      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <SheetContent className="glass-dark w-full overflow-auto border-white/10 backdrop-blur-xl sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3 text-gradient text-lg">
              <div className="gradient-primary flex size-10 items-center justify-center rounded-lg text-white">
                {getIcon()}
              </div>
              {card.title}
            </SheetTitle>
          </SheetHeader>
          <div className="relative mt-6 flex-1">
            <div className="mb-3 flex justify-end">
              <Button
                className="gradient-primary hover-lift glow-green h-9 gap-2 text-white"
                onClick={handleCopy}
                size="sm"
              >
                {isCopied ? (
                  <>
                    <CheckCircleFillIcon size={14} />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon size={14} />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-primary/20 bg-black/40 p-5 font-mono text-sm shadow-2xl">
              <code
                className={card.language ? `language-${card.language}` : ""}
              >
                {card.content}
              </code>
            </pre>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
