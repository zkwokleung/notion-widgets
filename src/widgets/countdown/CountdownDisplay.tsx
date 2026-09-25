import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { CountdownConfig } from "../../../shared/widgetConfigs";
import { formatValue, labelFor, type Part } from "./duration";

interface CountdownDisplayProps {
  parts: Part[];
  layout: CountdownConfig["layout"];
  labels: CountdownConfig["labels"];
  padZero: boolean;
  size: CountdownConfig["size"];
}

// Digits scale with the timer's width (a CSS container) so four units fit a narrow
// Notion column without wrapping, and stop growing at the size's ceiling.
const NUMBER_SIZE: Record<CountdownConfig["size"], string> = {
  sm: "text-[clamp(1.25rem,7cqw,1.875rem)]",
  md: "text-[clamp(1.5rem,10cqw,3rem)]",
  lg: "text-[clamp(1.75rem,14cqw,4.5rem)]",
};

const INLINE_SIZE: Record<CountdownConfig["size"], string> = {
  sm: "text-[clamp(1.125rem,5cqw,1.5rem)]",
  md: "text-[clamp(1.25rem,7cqw,2.25rem)]",
  lg: "text-[clamp(1.5rem,10cqw,3.75rem)]",
};

// The accent colour comes from CSS variables set on the timer element.
const ACCENT = "font-semibold leading-none tabular-nums text-(--cd-light) dark:text-(--cd-dark)";

function CountdownDisplay({ parts, layout, labels, padZero, size }: CountdownDisplayProps) {
  if (layout === "inline") {
    const text = parts
      .map((part) => `${formatValue(part, padZero)}${labels === "long" ? " " : ""}${labelFor(part, labels)}`)
      .join(labels === "none" ? ":" : " ");
    return <span className={cn("block text-center", ACCENT, INLINE_SIZE[size])}>{text}</span>;
  }

  const tiles = layout === "tiles";
  return (
    <div className={cn("flex flex-wrap items-start justify-center", tiles ? "gap-2" : "gap-1")}>
      {parts.map((part, index) => {
        const label = labelFor(part, labels);
        return (
          <Fragment key={part.unit}>
            {!tiles && index > 0 && (
              <span aria-hidden className={cn(NUMBER_SIZE[size], "leading-none text-muted-foreground")}>
                :
              </span>
            )}
            <div
              className={cn(
                "flex flex-col items-center",
                tiles ? "min-w-14 rounded-lg bg-muted px-2 py-2" : "min-w-10 px-0.5"
              )}
            >
              <span className={cn(ACCENT, NUMBER_SIZE[size])}>{formatValue(part, padZero)}</span>
              {label && (
                <span className="mt-1.5 text-xs tracking-wide text-muted-foreground uppercase">
                  {label}
                </span>
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

export default CountdownDisplay;
