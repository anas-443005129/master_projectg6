"use client";

import { memo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeIcon, GaugeIcon, GlobeIcon, TrendingUpIcon } from "./icons";

export type CloudContext = {
  provider: string;
  scale: string;
  traffic: string;
  region: string;
};

type CloudContextSelectorProps = {
  onContextChange: (context: CloudContext) => void;
  className?: string;
};

const providers = ["AWS", "Azure", "Google Cloud", "Multi-Cloud"];
const scales = ["Small (<1k users/day)", "Medium (1k-100k users/day)", "Large (>100k users/day)"];
const traffic = ["Steady", "Moderate spikes", "High variability", "Seasonal peaks"];
const regions = [
  "US East",
  "US West",
  "Europe",
  "Asia Pacific",
  "Middle East",
  "Global (Multi-region)",
];

function PureCloudContextSelector({ onContextChange, className }: CloudContextSelectorProps) {
  const [context, setContext] = useState<CloudContext>({
    provider: providers[0],
    scale: scales[0],
    traffic: traffic[0],
    region: regions[0],
  });

  const updateContext = (key: keyof CloudContext, value: string) => {
    const newContext = { ...context, [key]: value };
    setContext(newContext);
    onContextChange(newContext);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className || ""}`}>
      <Select
        value={context.provider}
        onValueChange={(value) => updateContext("provider", value)}
      >
        <SelectTrigger className="h-8 w-auto min-w-[130px] gap-2 rounded-lg border-muted-foreground/20 bg-muted/50 px-2 text-xs">
          <CodeIcon size={14} />
          <SelectValue placeholder="Provider" />
        </SelectTrigger>
        <SelectContent>
          {providers.map((provider) => (
            <SelectItem key={provider} value={provider} className="text-xs">
              {provider}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={context.scale}
        onValueChange={(value) => updateContext("scale", value)}
      >
        <SelectTrigger className="h-8 w-auto min-w-40 gap-2 rounded-lg border-muted-foreground/20 bg-muted/50 px-2 text-xs">
          <GaugeIcon size={14} />
          <SelectValue placeholder="Scale" />
        </SelectTrigger>
        <SelectContent>
          {scales.map((scale) => (
            <SelectItem key={scale} value={scale} className="text-xs">
              {scale}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={context.traffic}
        onValueChange={(value) => updateContext("traffic", value)}
      >
        <SelectTrigger className="h-8 w-auto min-w-[140px] gap-2 rounded-lg border-muted-foreground/20 bg-muted/50 px-2 text-xs">
          <TrendingUpIcon size={14} />
          <SelectValue placeholder="Traffic" />
        </SelectTrigger>
        <SelectContent>
          {traffic.map((t) => (
            <SelectItem key={t} value={t} className="text-xs">
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={context.region}
        onValueChange={(value) => updateContext("region", value)}
      >
        <SelectTrigger className="h-8 w-auto min-w-[140px] gap-2 rounded-lg border-muted-foreground/20 bg-muted/50 px-2 text-xs">
          <GlobeIcon size={14} />
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region} value={region} className="text-xs">
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const CloudContextSelector = memo(PureCloudContextSelector);
