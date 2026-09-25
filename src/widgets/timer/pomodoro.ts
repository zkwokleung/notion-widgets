import { z } from "zod";
import type { TimerConfig } from "../../../shared/widgetConfigs";

export type Phase = "focus" | "shortBreak" | "longBreak";

export const phaseLabels: Record<Phase, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

export const timerStateSchema = z.object({
  phase: z.enum(["focus", "shortBreak", "longBreak"]),
  /** Wall-clock end time while running; survives throttled or reloaded iframes. */
  endsAt: z.number().nullable(),
  /** Time left while paused; null means the phase's full duration. */
  pausedRemainingMs: z.number().nullable(),
  completedFocus: z.number().int().min(0),
  /** Increments on every automatic phase change, so the UI can chime once. */
  completions: z.number().int().min(0),
});

export type TimerState = z.infer<typeof timerStateSchema>;

export type TimerAction =
  | { type: "start"; now: number }
  | { type: "pause"; now: number }
  | { type: "reset" }
  | { type: "skip" }
  | { type: "select"; phase: Phase }
  | { type: "tick"; now: number };

export const initialTimerState: TimerState = {
  phase: "focus",
  endsAt: null,
  pausedRemainingMs: null,
  completedFocus: 0,
  completions: 0,
};

export function phaseDurationMs(phase: Phase, config: TimerConfig): number {
  const minutes =
    phase === "focus"
      ? config.focusMinutes
      : phase === "shortBreak"
        ? config.shortBreakMinutes
        : config.longBreakMinutes;
  return minutes * 60_000;
}

export function remainingMs(state: TimerState, config: TimerConfig, now: number): number {
  if (state.endsAt !== null) return Math.max(0, state.endsAt - now);
  return state.pausedRemainingMs ?? phaseDurationMs(state.phase, config);
}

function nextPhase(state: TimerState, config: TimerConfig): Pick<TimerState, "phase" | "completedFocus"> {
  if (state.phase !== "focus") return { phase: "focus", completedFocus: state.completedFocus };
  const completedFocus = state.completedFocus + 1;
  const longBreak = completedFocus % config.sessionsBeforeLongBreak === 0;
  return { phase: longBreak ? "longBreak" : "shortBreak", completedFocus };
}

export function timerReducer(config: TimerConfig) {
  return (state: TimerState, action: TimerAction): TimerState => {
    switch (action.type) {
      case "start":
        if (state.endsAt !== null) return state;
        return {
          ...state,
          endsAt: action.now + remainingMs(state, config, action.now),
          pausedRemainingMs: null,
        };
      case "pause":
        if (state.endsAt === null) return state;
        return { ...state, endsAt: null, pausedRemainingMs: remainingMs(state, config, action.now) };
      case "reset":
        return { ...state, endsAt: null, pausedRemainingMs: null };
      case "skip":
        return { ...state, ...nextPhase(state, config), endsAt: null, pausedRemainingMs: null };
      case "select":
        return { ...state, phase: action.phase, endsAt: null, pausedRemainingMs: null };
      case "tick":
        if (state.endsAt === null || action.now < state.endsAt) return state;
        return {
          ...state,
          ...nextPhase(state, config),
          endsAt: null,
          pausedRemainingMs: null,
          completions: state.completions + 1,
        };
    }
  };
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
