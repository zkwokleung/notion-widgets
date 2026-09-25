import { describe, expect, it } from "vitest";
import { timerConfigSchema } from "../../../shared/widgetConfigs";
import { formatClock, initialTimerState, remainingMs, timerReducer } from "./pomodoro";

const config = timerConfigSchema.parse({ focusMinutes: 25, sessionsBeforeLongBreak: 2 });
const reduce = timerReducer(config);
const MIN = 60_000;

describe("pomodoro timer", () => {
  it("counts down from the phase duration and pauses exactly", () => {
    let state = reduce(initialTimerState, { type: "start", now: 0 });
    expect(remainingMs(state, config, 10 * MIN)).toBe(15 * MIN);

    state = reduce(state, { type: "pause", now: 10 * MIN });
    expect(remainingMs(state, config, 99 * MIN)).toBe(15 * MIN);

    state = reduce(state, { type: "start", now: 100 * MIN });
    expect(state.endsAt).toBe(115 * MIN);
  });

  it("moves focus → short break → focus → long break as sessions complete", () => {
    let state = reduce(initialTimerState, { type: "start", now: 0 });
    state = reduce(state, { type: "tick", now: 25 * MIN });
    expect(state).toMatchObject({ phase: "shortBreak", completedFocus: 1, completions: 1, endsAt: null });

    state = reduce(reduce(state, { type: "start", now: 0 }), { type: "tick", now: 5 * MIN });
    expect(state.phase).toBe("focus");

    state = reduce(reduce(state, { type: "start", now: 0 }), { type: "tick", now: 25 * MIN });
    expect(state).toMatchObject({ phase: "longBreak", completedFocus: 2 });
  });

  it("ignores ticks before the end and skips without counting a completion", () => {
    const running = reduce(initialTimerState, { type: "start", now: 0 });
    expect(reduce(running, { type: "tick", now: 24 * MIN })).toBe(running);

    const skipped = reduce(running, { type: "skip" });
    expect(skipped).toMatchObject({ phase: "shortBreak", completions: 0, endsAt: null });
  });

  it("formats time as mm:ss rounding partial seconds up", () => {
    expect(formatClock(25 * MIN)).toBe("25:00");
    expect(formatClock(61_500)).toBe("01:02");
    expect(formatClock(0)).toBe("00:00");
  });
});
