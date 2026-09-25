import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/api/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  dictionaryConfigSchema,
  type DictionaryConfig,
} from "../../../shared/widgetConfigs";
import Dictionary from "./Dictionary";

const onChange = vi.fn<(next: DictionaryConfig) => void>();
const latest = () => onChange.mock.lastCall?.[0];

function StatefulDictionary({ initial, readOnly }: { initial: DictionaryConfig; readOnly: boolean }) {
  const [config, setConfig] = useState(initial);
  const handleChange = (next: DictionaryConfig) => {
    setConfig(next);
    onChange(next);
  };
  return <Dictionary config={config} onChange={handleChange} readOnly={readOnly} />;
}

function configWith(texts: string[], overrides: Partial<DictionaryConfig> = {}) {
  return dictionaryConfigSchema.parse({
    words: texts.map((text) => ({ id: text, from: "fr", to: "en", text })),
    ...overrides,
  });
}

function renderDictionary(initial: DictionaryConfig, readOnly = false) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TooltipProvider>
        <StatefulDictionary initial={initial} readOnly={readOnly} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const wordValues = () =>
  screen.getAllByRole("textbox", { name: "Word" }).map((input) => (input as HTMLInputElement).value);

describe("Dictionary", () => {
  beforeEach(() => {
    onChange.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ text: "x" })))
    );
  });

  it("removes the clicked row, not the last one", async () => {
    renderDictionary(configWith(["eau", "pain", "vin"]));
    expect(wordValues()).toEqual(["eau", "pain", "vin"]);

    await userEvent.click(screen.getAllByRole("button", { name: "Remove word" })[1]);

    expect(wordValues()).toEqual(["eau", "vin"]);
  });

  it("adds a word with the last word's languages and focuses it", async () => {
    renderDictionary(configWith(["eau"]));

    await userEvent.click(screen.getByRole("button", { name: "Add word" }));

    expect(wordValues()).toEqual(["eau", ""]);
    expect(screen.getAllByRole("textbox", { name: "Word" })[1]).toHaveFocus();
    expect(latest()?.words[1]).toMatchObject({ from: "fr", to: "en", text: "" });
  });

  it("adds a row below on Enter", async () => {
    renderDictionary(configWith(["eau", "vin"]));

    await userEvent.type(screen.getByDisplayValue("eau"), "{Enter}pain");

    expect(wordValues()).toEqual(["eau", "pain", "vin"]);
  });

  it("shows a hint when empty", () => {
    renderDictionary(configWith([]));
    expect(screen.getByText(/Add words to build your vocabulary list/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add word" })).toBeInTheDocument();
  });

  it("hides edit controls when read-only", () => {
    renderDictionary(configWith(["eau"]), true);

    expect(screen.queryByRole("button", { name: "Remove word" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add word" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dictionary options" })).not.toBeInTheDocument();
  });

  it("renders translations", async () => {
    renderDictionary(configWith(["eau"]));
    expect(await screen.findByText("x", {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it("keeps the shared pair on each word when leaving fixed languages", async () => {
    const review = { ease: 2.5, intervalDays: 1, repetitions: 1, dueAt: "2026-01-01" };
    renderDictionary(
      dictionaryConfigSchema.parse({
        fixedLang: { from: "ja", to: "ko" },
        words: [{ id: "eau", from: "fr", to: "en", text: "eau", review }],
      })
    );
    expect(screen.getByText(/Japanese/)).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "From language" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Dictionary options" }));
    await userEvent.click(screen.getByRole("switch", { name: "Same languages for all entries" }));

    expect(latest()?.fixedLang).toBeNull();
    expect(latest()?.words[0]).toEqual({ id: "eau", from: "ja", to: "ko", text: "eau", review });

    await userEvent.click(screen.getByRole("switch", { name: "Same languages for all entries" }));
    expect(latest()?.fixedLang).toEqual({ from: "ja", to: "ko" });
  });
});
