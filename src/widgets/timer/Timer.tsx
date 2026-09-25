import { Pause, Play, RotateCcw, Settings2, SkipForward } from "lucide-react";
import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TimerConfig } from "../../../shared/widgetConfigs";
import type { WidgetProps } from "../registry";
import { playChime } from "./chime";
import {
  formatClock,
  initialTimerState,
  phaseDurationMs,
  phaseLabels,
  remainingMs,
  timerReducer,
  timerStateSchema,
  type Phase,
  type TimerState,
} from "./pomodoro";
import TimerSettings from "./TimerSettings";

// Notion unloads embeds that scroll out of view; keep the countdown across reloads.
const STORAGE_KEY = "notion-widgets:timer";

function loadState(): TimerState {
  try {
    const parsed = timerStateSchema.safeParse(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"));
    return parsed.success ? parsed.data : initialTimerState;
  } catch {
    return initialTimerState;
  }
}

function saveState(state: TimerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Blocked storage only means the timer won't survive a reload.
  }
}

const PHASES: Phase[] = ["focus", "shortBreak", "longBreak"];

function Timer({ config, onChange, readOnly }: WidgetProps<TimerConfig>) {
  const reducer = useMemo(() => timerReducer(config), [config]);
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [now, setNow] = useState(() => Date.now());
  const running = state.endsAt !== null;

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const time = Date.now();
      setNow(time);
      dispatch({ type: "tick", now: time });
    }, 250);
    return () => clearInterval(interval);
  }, [running]);

  const chimedFor = useRef(state.completions);
  useEffect(() => {
    if (state.completions > chimedFor.current) playChime();
    chimedFor.current = state.completions;
  }, [state.completions]);

  useEffect(() => saveState(state), [state]);

  const left = remainingMs(state, config, now);
  const total = phaseDurationMs(state.phase, config);
  const sessionInCycle = state.completedFocus % config.sessionsBeforeLongBreak;

  const toggleRunning = () => {
    const time = Date.now();
    setNow(time);
    dispatch({ type: running ? "pause" : "start", now: time });
  };

  return (
    <div className="flex flex-col items-center gap-4 px-2 py-4 text-sm text-foreground">
      <ToggleGroup
        type="single"
        size="sm"
        value={state.phase}
        onValueChange={(value) => {
          if (value) dispatch({ type: "select", phase: value as Phase });
        }}
        aria-label="Timer phase"
      >
        {PHASES.map((phase) => (
          <ToggleGroupItem key={phase} value={phase} className="px-3 text-xs">
            {phaseLabels[phase]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div
        role="timer"
        aria-live="off"
        aria-label={`${phaseLabels[state.phase]}: ${formatClock(left)} left`}
        className="text-6xl font-semibold tracking-tight tabular-nums"
      >
        {formatClock(left)}
      </div>

      <Progress
        value={((total - left) / total) * 100}
        aria-label="Phase progress"
        className="max-w-xs"
      />

      <div className="flex items-center gap-1">
        <IconAction label="Reset" onClick={() => dispatch({ type: "reset" })}>
          <RotateCcw />
        </IconAction>
        <Button type="button" onClick={toggleRunning} className="min-w-28">
          {running ? <Pause /> : <Play />}
          {running ? "Pause" : left < total ? "Resume" : "Start"}
        </Button>
        <IconAction label="Skip to next phase" onClick={() => dispatch({ type: "skip" })}>
          <SkipForward />
        </IconAction>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex gap-1" aria-label={`Session ${sessionInCycle + 1} of ${config.sessionsBeforeLongBreak}`}>
          {Array.from({ length: config.sessionsBeforeLongBreak }, (_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full",
                i < sessionInCycle ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </span>
        <span>{state.completedFocus} done</span>
        {!readOnly && (
          <TimerSettings config={config} onChange={onChange}>
            <Button type="button" variant="ghost" size="icon-xs" aria-label="Timer settings">
              <Settings2 />
            </Button>
          </TimerSettings>
        )}
      </div>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={onClick}
          className="text-muted-foreground"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export default Timer;
