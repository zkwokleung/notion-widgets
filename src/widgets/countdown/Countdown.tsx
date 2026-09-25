import { CircleAlert, Settings2 } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { CountdownConfig } from "../../../shared/widgetConfigs";
import type { WidgetProps } from "../registry";
import CountdownDisplay from "./CountdownDisplay";
import CountdownSettings from "./CountdownSettings";
import {
  describe,
  nextTickDelay,
  resolveTarget,
  splitDuration,
  type Direction,
} from "./duration";
import { accentVars, FONTS, loadFont } from "./styles";
import { useNow } from "./useNow";

const targetFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

function Countdown({ config, onChange, readOnly }: WidgetProps<CountdownConfig>) {
  const { precision, afterEnd, font, color } = config;
  const targetMs = useMemo(() => resolveTarget(config.target), [config.target]);
  const valid = !Number.isNaN(targetMs);

  const nextDelay = useCallback(
    (now: number) => (valid ? nextTickDelay(targetMs - now, precision) : Infinity),
    [valid, targetMs, precision]
  );
  const now = useNow(nextDelay);

  useEffect(() => {
    void loadFont(font);
  }, [font]);

  const remaining = targetMs - now;
  const direction: Direction = remaining > 0 ? "down" : afterEnd === "countUp" ? "up" : "done";
  const parts = splitDuration(direction === "done" ? 0 : remaining, precision);

  return (
    <div className="flex flex-col items-center gap-3 px-2 py-4 text-sm text-foreground">
      {config.title && (
        <h2 className="text-center text-sm font-medium text-muted-foreground">{config.title}</h2>
      )}

      {valid ? (
        <div
          role="timer"
          aria-live="off"
          aria-label={describe(parts, direction)}
          className="w-full @container"
          style={{ ...accentVars(color), fontFamily: FONTS[font].family }}
        >
          <CountdownDisplay
            parts={parts}
            layout={config.layout}
            labels={config.labels}
            padZero={config.padZero}
            size={config.size}
          />
        </div>
      ) : (
        <Alert className="border-border bg-transparent text-muted-foreground">
          <CircleAlert />
          <AlertDescription>Pick a date in settings.</AlertDescription>
        </Alert>
      )}

      {direction === "done" && config.doneMessage && (
        <p className="text-center text-base font-medium">{config.doneMessage}</p>
      )}
      {direction === "up" && <p className="text-xs text-muted-foreground">since</p>}

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {valid && (
          <time dateTime={new Date(targetMs).toISOString()}>{targetFormat.format(targetMs)}</time>
        )}
        {!readOnly && (
          <CountdownSettings config={config} onChange={onChange}>
            <Button type="button" variant="ghost" size="icon-xs" aria-label="Countdown settings">
              <Settings2 />
            </Button>
          </CountdownSettings>
        )}
      </div>
    </div>
  );
}

export default Countdown;
