import { Settings2 } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import type { ProgressPeriod, YearProgressConfig } from "../../../shared/widgetConfigs";
import { accentVars, FONTS, loadFont } from "../appearance";
import type { WidgetProps } from "../registry";
import {
  describe,
  dotsFor,
  elapsedFraction,
  floorPercent,
  formatPercent,
  nextTickDelay,
  periodLabel,
  periodSpan,
  remainingLabel,
  sortPeriods,
  type Span,
} from "./progress";
import YearProgressSettings from "./YearProgressSettings";

type Size = YearProgressConfig["size"];

const ACCENT = "font-semibold leading-none tabular-nums text-(--accent-light) dark:text-(--accent-dark)";
const FILL = "bg-(--accent-light) dark:bg-(--accent-dark)";

const PERCENT_SIZE: Record<Size, string> = { sm: "text-base", md: "text-xl", lg: "text-3xl" };
const BAR_HEIGHT: Record<Size, string> = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
const DOT_SIZE: Record<Size, string> = { sm: "size-1.5", md: "size-2", lg: "size-3" };
const RING: Record<Size, { diameter: number; stroke: number }> = {
  sm: { diameter: 72, stroke: 6 },
  md: { diameter: 104, stroke: 8 },
  lg: { diameter: 144, stroke: 10 },
};

interface RowProps {
  period: ProgressPeriod;
  span: Span;
  now: number;
  config: YearProgressConfig;
}

function Heading({ period, span, size }: Pick<RowProps, "period" | "span"> & { size: Size }) {
  return (
    <span className={cn("text-xs tracking-wide text-muted-foreground uppercase", size === "lg" && "text-sm")}>
      {periodLabel(period, span)}
    </span>
  );
}

function Remaining({ period, span, now, config }: RowProps) {
  if (!config.showRemaining) return null;
  return <span className="text-xs text-muted-foreground">{remainingLabel(period, span, now)}</span>;
}

function BarRow(props: RowProps) {
  const { span, now, config } = props;
  const fraction = elapsedFraction(span, now);
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <Heading period={props.period} span={span} size={config.size} />
        <span className={cn(ACCENT, PERCENT_SIZE[config.size])}>{formatPercent(fraction, config.decimals)}</span>
      </div>
      <div className={cn("w-full overflow-hidden rounded-full bg-muted", BAR_HEIGHT[config.size])}>
        <div className={cn("h-full rounded-full transition-[width]", FILL)} style={{ width: `${fraction * 100}%` }} />
      </div>
      <Remaining {...props} />
    </>
  );
}

function DotsRow(props: RowProps) {
  const { period, span, now, config } = props;
  const fraction = elapsedFraction(span, now);
  const { total, done } = dotsFor(period, span, now);
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <Heading period={period} span={span} size={config.size} />
        <span className={cn(ACCENT, PERCENT_SIZE[config.size])}>{formatPercent(fraction, config.decimals)}</span>
      </div>
      <div aria-hidden className="flex flex-wrap gap-1">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={cn(
              "rounded-full",
              DOT_SIZE[config.size],
              index < done ? FILL : index === done ? cn(FILL, "opacity-40") : "bg-muted"
            )}
          />
        ))}
      </div>
      <Remaining {...props} />
    </>
  );
}

function RingRow(props: RowProps) {
  const { period, span, now, config } = props;
  const fraction = elapsedFraction(span, now);
  const { diameter, stroke } = RING[config.size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <>
      <div className="relative" style={{ width: diameter, height: diameter }}>
        <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`} className="-rotate-90">
          <circle cx={diameter / 2} cy={diameter / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-muted" />
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - fraction)}
            className="stroke-(--accent-light) transition-[stroke-dashoffset] dark:stroke-(--accent-dark)"
          />
        </svg>
        <span className={cn("absolute inset-0 flex items-center justify-center", ACCENT, PERCENT_SIZE[config.size])}>
          {formatPercent(fraction, config.decimals)}
        </span>
      </div>
      <Heading period={period} span={span} size={config.size} />
      <Remaining {...props} />
    </>
  );
}

const ROWS: Record<YearProgressConfig["style"], (props: RowProps) => React.JSX.Element> = {
  bar: BarRow,
  dots: DotsRow,
  ring: RingRow,
};

function YearProgress({ config, onChange, readOnly }: WidgetProps<YearProgressConfig>) {
  const { decimals, weekStart, style, font, color } = config;
  const periods = useMemo(() => sortPeriods(config.periods), [config.periods]);

  const nextDelay = useCallback(
    (now: number) =>
      Math.min(...periods.map((period) => nextTickDelay(periodSpan(period, now, weekStart), now, decimals))),
    [periods, weekStart, decimals]
  );
  const now = useNow(nextDelay);

  useEffect(() => {
    void loadFont(font);
  }, [font]);

  const Row = ROWS[style];
  const ring = style === "ring";

  return (
    <div className="flex flex-col items-center gap-3 px-2 py-4 text-sm text-foreground">
      {config.title && (
        <h2 className="text-center text-sm font-medium text-muted-foreground">{config.title}</h2>
      )}

      <div
        className={cn("flex w-full", ring ? "flex-row flex-wrap justify-center gap-6" : "flex-col gap-4")}
        style={{ ...accentVars(color), fontFamily: FONTS[font].family }}
      >
        {periods.map((period) => {
          const span = periodSpan(period, now, weekStart);
          return (
            <div
              key={period}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={floorPercent(elapsedFraction(span, now), decimals)}
              aria-label={describe(period, span, now, decimals)}
              className={cn("flex gap-1.5", ring ? "flex-col items-center" : "w-full flex-col")}
            >
              <Row period={period} span={span} now={now} config={config} />
            </div>
          );
        })}
      </div>

      {!readOnly && (
        <YearProgressSettings config={config} onChange={onChange}>
          <Button type="button" variant="ghost" size="icon-xs" aria-label="Year progress settings">
            <Settings2 />
          </Button>
        </YearProgressSettings>
      )}
    </div>
  );
}

export default YearProgress;
