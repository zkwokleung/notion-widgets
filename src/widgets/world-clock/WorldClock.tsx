import { Moon, Settings2, Sun } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import type { Clock, WorldClockConfig } from "../../../shared/widgetConfigs";
import { accentVars, FONTS, loadFont } from "../appearance";
import type { WidgetProps } from "../registry";
import {
  clockName,
  describe,
  formatDate,
  formatTime,
  isDaytime,
  nextTickDelay,
  offsetFrom,
  offsetLabel,
  viewerTimeZone,
} from "./zones";
import WorldClockSettings from "./WorldClockSettings";

type Size = WorldClockConfig["size"];

const ACCENT = "font-semibold leading-none tabular-nums text-(--accent-light) dark:text-(--accent-dark)";

const TIME_SIZE: Record<Size, string> = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
const NAME_SIZE: Record<Size, string> = { sm: "text-xs", md: "text-sm", lg: "text-base" };
const ICON_SIZE: Record<Size, string> = { sm: "size-3", md: "size-3.5", lg: "size-4" };

interface RowProps {
  clock: Clock;
  now: number;
  base: string;
  config: WorldClockConfig;
}

function Name({ clock, now, config }: RowProps) {
  const DayIcon = isDaytime(now, clock.timeZone) ? Sun : Moon;
  return (
    <span className={cn("flex items-center gap-1.5 font-medium", NAME_SIZE[config.size])}>
      <DayIcon aria-hidden className={cn("shrink-0 text-muted-foreground", ICON_SIZE[config.size])} />
      <span className="truncate">{clockName(clock)}</span>
    </span>
  );
}

function Details({ clock, now, base, config }: RowProps) {
  const details: string[] = [];
  if (config.showDate) details.push(formatDate(now, clock.timeZone));
  if (config.showOffset) details.push(offsetLabel(offsetFrom(now, clock.timeZone, base)));
  if (details.length === 0) return null;
  return <span className="text-xs text-muted-foreground">{details.join(" · ")}</span>;
}

function Time({ clock, now, config }: RowProps) {
  return (
    <time dateTime={new Date(now).toISOString()} className={cn(ACCENT, TIME_SIZE[config.size])}>
      {formatTime(now, clock.timeZone, config.hourCycle, config.showSeconds)}
    </time>
  );
}

function ListRow(props: RowProps) {
  return (
    <>
      <div className="flex min-w-0 flex-col gap-1">
        <Name {...props} />
        <Details {...props} />
      </div>
      <Time {...props} />
    </>
  );
}

function GridRow(props: RowProps) {
  return (
    <>
      <Name {...props} />
      <Time {...props} />
      <Details {...props} />
    </>
  );
}

function WorldClock({ config, onChange, readOnly }: WidgetProps<WorldClockConfig>) {
  const { clocks, layout, showSeconds, font, color } = config;
  const base = useMemo(() => viewerTimeZone(), []);

  const nextDelay = useCallback((now: number) => nextTickDelay(now, showSeconds), [showSeconds]);
  const now = useNow(nextDelay);

  useEffect(() => {
    void loadFont(font);
  }, [font]);

  const grid = layout === "grid";
  const Row = grid ? GridRow : ListRow;

  return (
    <div className="flex flex-col items-center gap-3 px-2 py-4 text-sm text-foreground">
      {config.title && (
        <h2 className="text-center text-sm font-medium text-muted-foreground">{config.title}</h2>
      )}

      <ul
        className={cn(
          "w-full",
          grid ? "grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-4" : "flex flex-col divide-y divide-border"
        )}
        style={{ ...accentVars(color), fontFamily: FONTS[font].family }}
      >
        {clocks.map((clock) => (
          <li
            key={clock.id}
            aria-label={describe(clock, now, config, base)}
            className={cn(
              "flex",
              grid ? "flex-col items-center gap-1.5 text-center" : "items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
            )}
          >
            <Row clock={clock} now={now} base={base} config={config} />
          </li>
        ))}
      </ul>

      {!readOnly && (
        <WorldClockSettings config={config} onChange={onChange}>
          <Button type="button" variant="ghost" size="icon-xs" aria-label="World clock settings">
            <Settings2 />
          </Button>
        </WorldClockSettings>
      )}
    </div>
  );
}

export default WorldClock;
