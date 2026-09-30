import { useCallback, useEffect, useMemo } from "react";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import type { AnalogClockConfig } from "../../../shared/widgetConfigs";
import { accentVars, FONTS, loadFont } from "../appearance";
import type { WidgetProps } from "../registry";
import { cityName, formatDate, formatTime, localTime, nextTickDelay, viewerTimeZone } from "../world-clock/zones";
import Dial from "./Dial";
import { FACES, handAngles } from "./faces";

type Size = AnalogClockConfig["size"];

const DIAL_WIDTH: Record<Size, string> = { sm: "max-w-36", md: "max-w-52", lg: "max-w-72" };
function AnalogClock({ config }: WidgetProps<AnalogClockConfig>) {
  const { face, showSeconds, showDigital, showDate, font, color, size } = config;
  const zone = useMemo(() => config.timeZone ?? viewerTimeZone(), [config.timeZone]);
  const spec = FACES[face];

  const nextDelay = useCallback((now: number) => nextTickDelay(now, showSeconds), [showSeconds]);
  const now = useNow(nextDelay);

  useEffect(() => {
    void loadFont(font);
  }, [font]);

  const time = localTime(now, zone);
  const angles = handAngles(time);
  const fontFamily = FONTS[font].family;
  const numeralFont = fontFamily ?? (spec.serifNumerals ? "Georgia, serif" : undefined);
  const digital = formatTime(now, zone, "auto", showSeconds);
  const place = config.timeZone ? cityName(config.timeZone) : null;

  return (
    <div className="flex flex-col items-center gap-3 px-2 py-4 text-sm text-foreground">
      {config.title && (
        <h2 className="text-center text-sm font-medium text-muted-foreground">{config.title}</h2>
      )}

      <div
        role="img"
        aria-label={`${place ?? "Clock"}: ${digital}${showDate ? `, ${formatDate(now, zone)}` : ""}`}
        className={cn("flex w-full flex-col items-center gap-2", DIAL_WIDTH[size])}
        style={{ ...accentVars(color), fontFamily }}
      >
        <Dial spec={spec} angles={angles} showSeconds={showSeconds} numeralFont={numeralFont} />
        {(showDigital || showDate || place) && (
          <div className="flex flex-col items-center gap-0.5">
            {showDigital && (
              <time dateTime={new Date(now).toISOString()} className="text-base font-medium tabular-nums">
                {digital}
              </time>
            )}
            {(place || showDate) && (
              <span className="text-xs text-muted-foreground">
                {[place, showDate ? formatDate(now, zone) : null].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalogClock;
