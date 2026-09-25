import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { timerConfigSchema } from "../../../shared/widgetConfigs";
import Timer from "./Timer";

function renderTimer(readOnly = false) {
  const config = timerConfigSchema.parse({ focusMinutes: 25, shortBreakMinutes: 5 });
  return render(
    <TooltipProvider>
      <Timer config={config} onChange={() => {}} readOnly={readOnly} />
    </TooltipProvider>
  );
}

describe("Timer", () => {
  afterEach(() => localStorage.clear());

  it("starts, pauses and resumes the focus session", async () => {
    renderTimer();
    expect(screen.getByRole("timer")).toHaveTextContent("25:00");

    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: /Resume|Start/ })).toBeInTheDocument();
  });

  it("skips to the break and remembers the phase across reloads", async () => {
    const { unmount } = renderTimer();
    await userEvent.click(screen.getByRole("button", { name: "Skip to next phase" }));
    expect(screen.getByRole("timer")).toHaveTextContent("05:00");
    expect(screen.getByRole("radio", { name: "Short break" })).toHaveAttribute("data-state", "on");

    unmount();
    renderTimer();
    expect(screen.getByRole("timer")).toHaveTextContent("05:00");
  });

  it("hides settings on read-only links", () => {
    renderTimer(true);
    expect(screen.queryByRole("button", { name: "Timer settings" })).not.toBeInTheDocument();
  });
});
