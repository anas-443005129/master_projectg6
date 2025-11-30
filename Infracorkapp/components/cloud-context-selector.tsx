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
const scales = [
  "Small (<1k users/day)",
  "Medium (1k-100k users/day)",
  "Large (>100k users/day)",
];
const traffic = [
  "Steady",
  "Moderate spikes",
  "High variability",
  "Seasonal peaks",
];
const regions = [
  "US East",
  "US West",
  "Europe",
  "Asia Pacific",
  "Middle East",
  "Global (Multi-region)",
];

function PureCloudContextSelector({
  onContextChange,
  className,
}: CloudContextSelectorProps) {
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
    <div className={`flex flex-wrap gap-2.5 ${className || ""}`}>
      <Select
        onValueChange={(value) => updateContext("provider", value)}
        value={context.provider}
      >
        <SelectTrigger className="glass dark:glass-dark hover-lift h-9 w-auto min-w-[140px] gap-2 rounded-lg border-primary/30 px-3 font-medium text-xs shadow-sm">
          <CodeIcon size={14} />
          <SelectValue placeholder="Provider" />
        </SelectTrigger>
        <SelectContent>
          {providers.map((provider) => (
            <SelectItem className="text-xs" key={provider} value={provider}>
              {provider}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => updateContext("scale", value)}
        value={context.scale}
      >
        <SelectTrigger className="glass dark:glass-dark hover-lift h-9 w-auto min-w-[200px] gap-2 rounded-lg border-primary/30 px-3 font-medium text-xs shadow-sm">
          <GaugeIcon size={14} />
          <SelectValue placeholder="Scale" />
        </SelectTrigger>
        <SelectContent>
          {scales.map((scale) => (
            <SelectItem className="text-xs" key={scale} value={scale}>
              {scale}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => updateContext("traffic", value)}
        value={context.traffic}
      >
        <SelectTrigger className="glass dark:glass-dark hover-lift h-9 w-auto min-w-[150px] gap-2 rounded-lg border-primary/30 px-3 font-medium text-xs shadow-sm">
          <TrendingUpIcon size={14} />
          <SelectValue placeholder="Traffic" />
        </SelectTrigger>
        <SelectContent>
          {traffic.map((t) => (
            <SelectItem className="text-xs" key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => updateContext("region", value)}
        value={context.region}
      >
        <SelectTrigger className="glass dark:glass-dark hover-lift h-9 w-auto min-w-[180px] gap-2 rounded-lg border-primary/30 px-3 font-medium text-xs shadow-sm">
          <GlobeIcon size={14} />
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem className="text-xs" key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const CloudContextSelector = memo(PureCloudContextSelector);
