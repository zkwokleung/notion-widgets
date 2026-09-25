import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { countdownConfigSchema, type CountdownConfig } from "../../../shared/widgetConfigs";
import Countdown from "./Countdown";

// Local wall-clock times, so the expected parts don't depend on the machine's zone.
const NOW = new Date(2026, 0, 1, 0, 0, 0).getTime();
const TARGET = "2026-01-03T01:02:03";

function renderCountdown(
  overrides: Partial<CountdownConfig> = {},
  { readOnly = false, onChange = () => {} }: { readOnly?: boolean; onChange?: (next: CountdownConfig) => void } = {}
) {
  const config = { ...countdownConfigSchema.parse({ target: TARGET }), ...overrides };
  return render(
    <TooltipProvider>
      <Countdown config={config} onChange={onChange} readOnly={readOnly} />
    </TooltipProvider>
  );
}

describe("Countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("shows the time left as days, hours, minutes and seconds", () => {
    renderCountdown();
    const timer = screen.getByRole("timer");
    expect(timer).toHaveTextContent(/2\s*Days/);
    expect(timer).toHaveTextContent(/01\s*Hour(?!s)/);
    expect(timer).toHaveTextContent(/02\s*Minutes/);
    expect(timer).toHaveTextContent(/03\s*Seconds/);
    expect(timer).toHaveAccessibleName("2 days, 1 hour, 2 minutes, 3 seconds left");
    expect(screen.getByRole("heading", { name: "New Year" })).toBeInTheDocument();
  });

  it("ticks once a second", () => {
    renderCountdown();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent(/02\s*Seconds/);
  });

  it("stops at zero and shows the message once the date is reached", () => {
    renderCountdown({ target: "2025-12-31T12:00", doneMessage: "Happy new year!" });
    expect(screen.getByRole("timer")).toHaveAccessibleName("Time's up");
    expect(screen.getByRole("timer")).toHaveTextContent(/0\s*Days/);
    expect(screen.getByText("Happy new year!")).toBeInTheDocument();
  });

  it("counts up after the date when asked", () => {
    renderCountdown({ target: "2025-12-31T00:00", afterEnd: "countUp", precision: "days" });
    expect(screen.getByRole("timer")).toHaveTextContent(/1\s*Day$/);
    expect(screen.getByRole("timer")).toHaveAccessibleName("1 day since");
    expect(screen.getByText("since")).toBeInTheDocument();
  });

  it("renders the inline layout with short labels", () => {
    renderCountdown({ layout: "inline", labels: "short" });
    expect(screen.getByRole("timer")).toHaveTextContent("2d 01h 02m 03s");
  });

  it("asks for a date when the target can't be read", () => {
    renderCountdown({ target: "not a date" });
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.getByText("Pick a date in settings.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Countdown settings" })).toBeInTheDocument();
  });

  it("hides settings on read-only links", () => {
    renderCountdown({}, { readOnly: true });
    expect(screen.queryByRole("button", { name: "Countdown settings" })).not.toBeInTheDocument();
  });
});

// Real timers here: Radix's dialog and user-event don't get along with fake ones.
describe("Countdown settings", () => {
  it("changes the layout and colour", async () => {
    const onChange = vi.fn();
    renderCountdown({}, { onChange });

    await userEvent.click(screen.getByRole("button", { name: "Countdown settings" }));
    await userEvent.click(screen.getByRole("radio", { name: "Inline" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ layout: "inline" }));

    await userEvent.click(screen.getByRole("radio", { name: "Blue" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ color: "blue" }));
  });

  it("keeps the same instant when switching to a shared target", async () => {
    const onChange = vi.fn();
    renderCountdown({}, { onChange });

    await userEvent.click(screen.getByRole("button", { name: "Countdown settings" }));
    await userEvent.click(screen.getByRole("switch", { name: "Same moment for every viewer" }));
    const next = onChange.mock.lastCall?.[0] as CountdownConfig;
    expect(next.target).toMatch(/Z$/);
    expect(Date.parse(next.target)).toBe(new Date(2026, 0, 3, 1, 2).getTime());
  });
});
