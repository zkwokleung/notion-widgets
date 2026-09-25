import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/api/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { whiteboardConfigSchema } from "../../../shared/widgetConfigs";
import Whiteboard from "./Whiteboard";

function StatefulWhiteboard() {
  const [config, setConfig] = useState(() => whiteboardConfigSchema.parse({}));
  return <Whiteboard config={config} onChange={setConfig} readOnly={false} />;
}

function drawStroke(canvas: HTMLElement, y = 50) {
  fireEvent.pointerDown(canvas, { button: 0, pointerId: 1, clientX: 10, clientY: y });
  fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 90, clientY: y });
  fireEvent.pointerUp(canvas, { pointerId: 1, clientX: 90, clientY: y });
}

describe("Whiteboard", () => {
  let recognitions: string[][];

  beforeEach(() => {
    recognitions = [["十", "+"], ["一", "ー"]];
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        if (String(input).startsWith("/api/handwriting")) {
          return Promise.resolve(Response.json({ candidates: recognitions.shift() ?? [] }));
        }
        return Promise.resolve(Response.json({ text: "ten" }));
      })
    );
    render(
      <QueryClientProvider client={createQueryClient()}>
        <TooltipProvider>
          <StatefulWhiteboard />
        </TooltipProvider>
      </QueryClientProvider>
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("recognizes a drawing, appends the chosen suggestion and translates it", async () => {
    drawStroke(screen.getByRole("img", { name: "Handwriting area" }));
    await userEvent.click(await screen.findByRole("button", { name: "十" }));

    expect(screen.getByLabelText("Written text")).toHaveValue("十");
    expect(await screen.findByText("ten")).toBeInTheDocument();
    expect(screen.getByText("Suggestions appear as you write.")).toBeInTheDocument();
  });

  it("never offers the previous drawing's suggestions for a new one", async () => {
    const canvas = screen.getByRole("img", { name: "Handwriting area" });
    drawStroke(canvas);
    await userEvent.click(await screen.findByRole("button", { name: "十" }));

    drawStroke(canvas, 80);
    expect(screen.queryByRole("button", { name: "十" })).not.toBeInTheDocument();
    expect(screen.getByText("Recognizing…")).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("button", { name: "一" }));

    expect(screen.getByLabelText("Written text")).toHaveValue("十一");
  });

  it("undoes strokes and deletes characters", async () => {
    drawStroke(screen.getByRole("img", { name: "Handwriting area" }));
    await userEvent.click(screen.getByRole("button", { name: "Undo stroke" }));
    expect(screen.getByText("Suggestions appear as you write.")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Written text"), "水の");
    await userEvent.click(screen.getByRole("button", { name: "Delete last character" }));
    expect(screen.getByLabelText("Written text")).toHaveValue("水");
  });
});
