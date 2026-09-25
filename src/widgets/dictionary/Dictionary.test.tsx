import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "../../api/queryClient";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  dictionaryConfigSchema,
  type DictionaryConfig,
} from "../../../shared/widgetConfigs";
import Dictionary from "./Dictionary";

function StatefulDictionary({ initial }: { initial: DictionaryConfig }) {
  const [config, setConfig] = useState(initial);
  return <Dictionary config={config} onChange={setConfig} readOnly={false} />;
}

function renderDictionary(texts: string[]) {
  const initial = dictionaryConfigSchema.parse({
    words: texts.map((text) => ({ id: text, from: "fr", to: "en", text })),
  });
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <StatefulDictionary initial={initial} />
    </QueryClientProvider>
  );
}

const rowValues = () =>
  screen
    .getAllByDisplayValue(/^(eau|pain|vin)$/)
    .map((input) => (input as HTMLInputElement).value);

describe("Dictionary", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ text: "x" })))
    );
  });

  it("removes the clicked row, not the last one", async () => {
    renderDictionary(["eau", "pain", "vin"]);
    expect(rowValues()).toEqual(["eau", "pain", "vin"]);

    const painInput = screen.getByDisplayValue("pain");
    const painRow = painInput.closest(".MuiGrid-container") as HTMLElement;
    await userEvent.click(within(painRow).getByTestId("CloseIcon"));

    expect(rowValues()).toEqual(["eau", "vin"]);
  });
});
