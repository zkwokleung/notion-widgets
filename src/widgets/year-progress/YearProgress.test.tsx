import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { yearProgressConfigSchema, type YearProgressConfig } from "../../../shared/widgetConfigs";
import YearProgress from "./YearProgress";

const NOW = new Date(2026, 8, 29, 6).getTime();

function renderWidget(
  overrides: Partial<YearProgressConfig> = {},
  { readOnly = false, onChange = () => {} }: { readOnly?: boolean; onChange?: (next: YearProgressConfig) => void } = {}
) {
  const config = { ...yearProgressConfigSchema.parse({}), ...overrides };
  return render(
    <TooltipProvider>
      <YearProgress config={config} onChange={onChange} readOnly={readOnly} />
    </TooltipProvider>
  );
}

describe("YearProgress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("shows the year's progress by default", () => {
    renderWidget();
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAccessibleName(/^Year 2026: 74[.,]3\s?% elapsed, 94 days left$/);
    expect(bar).toHaveAttribute("aria-valuenow", "74.3");
    expect(bar).toHaveTextContent("2026");
    expect(bar).toHaveTextContent("94 days left");
  });

  it("renders one row per period, longest first", () => {
    renderWidget({ periods: ["day", "week", "year"], decimals: 0 });
    const names = screen.getAllByRole("progressbar").map((bar) => bar.getAttribute("aria-label"));
    expect(names).toEqual([
      expect.stringMatching(/^Year 2026/),
      expect.stringMatching(/^Week /),
      expect.stringMatching(/^Day Tuesday: 25\s?% elapsed, 18 hours left$/),
    ]);
  });

  it("hides the time left when asked", () => {
    renderWidget({ showRemaining: false });
    expect(screen.queryByText(/left$/)).not.toBeInTheDocument();
  });

  it("shows the title and the dots style", () => {
    renderWidget({ title: "Time flies", style: "dots", periods: ["day"] });
    expect(screen.getByRole("heading", { name: "Time flies" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar").querySelectorAll("span.rounded-full")).toHaveLength(24);
  });

  it("draws a ring", () => {
    renderWidget({ style: "ring", periods: ["day"], decimals: 0 });
    const bar = screen.getByRole("progressbar");
    expect(bar.querySelectorAll("circle")).toHaveLength(2);
    expect(bar).toHaveTextContent(/25\s?%/);
  });

  it("advances as time passes", () => {
    renderWidget({ periods: ["day"], decimals: 2 });
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
    act(() => {
      vi.advanceTimersByTime(8640);
    });
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25.01");
  });

  it("hides settings on read-only links", () => {
    renderWidget({}, { readOnly: true });
    expect(screen.queryByRole("button", { name: "Year progress settings" })).not.toBeInTheDocument();
  });
});

describe("YearProgress settings", () => {
  it("adds a period, keeps at least one, and changes the style", async () => {
    const onChange = vi.fn();
    renderWidget({}, { onChange });

    await userEvent.click(screen.getByRole("button", { name: "Year progress settings" }));
    await userEvent.click(screen.getByRole("button", { name: "Day" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ periods: ["year", "day"] }));

    await userEvent.click(screen.getByRole("button", { name: "Year" }));
    expect(onChange).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("radio", { name: "Ring" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ style: "ring" }));

    await userEvent.click(screen.getByRole("radio", { name: "2" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ decimals: 2 }));
  });

  it("only offers the week start when the week is shown", async () => {
    const onChange = vi.fn();
    renderWidget({ periods: ["week"] }, { onChange });

    await userEvent.click(screen.getByRole("button", { name: "Year progress settings" }));
    await userEvent.click(screen.getByRole("radio", { name: "Sunday" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ weekStart: "sunday" }));
  });
});
