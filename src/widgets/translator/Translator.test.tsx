import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/api/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { TranslatorConfig } from "../../../shared/widgetConfigs";
import Translator from "./Translator";

function StatefulTranslator({
  initial,
  readOnly,
}: {
  initial: TranslatorConfig;
  readOnly: boolean;
}) {
  const [config, setConfig] = useState(initial);
  return <Translator config={config} onChange={setConfig} readOnly={readOnly} />;
}

function renderTranslator(initial: TranslatorConfig, readOnly = false) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TooltipProvider>
        <StatefulTranslator initial={initial} readOnly={readOnly} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const translations = () =>
  within(screen.getByRole("list", { name: "Translations" }))
    .getAllByRole("status")
    .map((output) => output.getAttribute("aria-label"));

describe("Translator", () => {

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const params = new URL(String(input), "http://localhost").searchParams;
        return Promise.resolve(
          Response.json({ text: `[${params.get("tl")}] ${params.get("q")}` })
        );
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a translation for each target language", async () => {
    renderTranslator({ from: "en", to: ["fr", "ja"] });
    await userEvent.type(screen.getByLabelText("Text to translate"), "hello");

    expect(await screen.findByText("[fr] hello", {}, { timeout: 2000 })).toBeInTheDocument();
    expect(await screen.findByText("[ja] hello")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "French translation" })).toHaveTextContent(
      "[fr] hello"
    );
  });

  it("adds the first unused language", async () => {
    renderTranslator({ from: "en", to: ["fr"] });
    await userEvent.click(screen.getByRole("button", { name: "Add language" }));

    expect(translations()).toEqual(["French translation", "Chinese (Taiwan) translation"]);
  });

  it("removes the clicked language", async () => {
    renderTranslator({ from: "en", to: ["fr", "ja", "de"] });
    await userEvent.click(screen.getByRole("button", { name: "Remove Japanese" }));

    expect(translations()).toEqual(["French translation", "German translation"]);
  });

  it("drops the new source language from the targets", async () => {
    renderTranslator({ from: "en", to: ["fr", "ja"] });
    await userEvent.click(screen.getByRole("combobox", { name: "Source language" }));
    await userEvent.click(screen.getByRole("option", { name: /French/ }));

    expect(screen.getByRole("combobox", { name: "Source language" })).toHaveTextContent(
      "French"
    );
    expect(translations()).toEqual(["Japanese translation"]);
  });

  it("swaps the source with the first target, carrying the translation over", async () => {
    renderTranslator({ from: "en", to: ["fr", "ja"] });
    const input = screen.getByLabelText("Text to translate");
    await userEvent.type(input, "hello");
    await screen.findByText("[fr] hello", {}, { timeout: 2000 });

    await userEvent.click(screen.getByRole("button", { name: "Swap languages" }));

    expect(screen.getByRole("combobox", { name: "Source language" })).toHaveTextContent(
      "French"
    );
    expect(translations()).toEqual(["English translation", "Japanese translation"]);
    expect(input).toHaveValue("[fr] hello");
  });

  it("hides editing controls and locks pickers when read-only", () => {
    renderTranslator({ from: "en", to: ["fr", "ja"] }, true);

    expect(screen.queryByRole("button", { name: "Add language" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Remove/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Swap languages" })).not.toBeInTheDocument();
    for (const picker of screen.getAllByRole("combobox")) expect(picker).toBeDisabled();
    expect(translations()).toHaveLength(2);
  });
});
