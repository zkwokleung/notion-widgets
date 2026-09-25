import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/api/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { dictionaryConfigSchema, type DictionaryConfig } from "../../../shared/widgetConfigs";
import Dictionary from "./Dictionary";

const translations: Record<string, string> = { eau: "water", pain: "bread", vin: "wine" };

let latest: DictionaryConfig;

function StatefulDictionary({ initial }: { initial: DictionaryConfig }) {
  const [config, setConfig] = useState(initial);
  const handleChange = (next: DictionaryConfig) => {
    latest = next;
    setConfig(next);
  };
  return <Dictionary config={config} onChange={handleChange} readOnly={false} />;
}

function renderDictionary(words: Partial<DictionaryConfig["words"][number]>[]) {
  const initial = dictionaryConfigSchema.parse({
    words: words.map((word, i) => ({ id: `w${i}`, from: "fr", to: "en", text: "", ...word })),
  });
  latest = initial;
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TooltipProvider>
        <StatefulDictionary initial={initial} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

describe("Dictionary study mode", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const q = new URL(String(input), "http://localhost").searchParams.get("q") ?? "";
        return Promise.resolve(Response.json({ text: translations[q] ?? q }));
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows due cards, reveals the translation and schedules the grade", async () => {
    const future = new Date(Date.now() + 86_400_000 * 3).toISOString();
    renderDictionary([
      { text: "eau" },
      { text: "pain", review: { ease: 2.5, intervalDays: 3, repetitions: 1, dueAt: future } },
    ]);

    const studyTab = screen.getByRole("radio", { name: /Study/ });
    expect(studyTab).toHaveTextContent("1 due");
    await userEvent.click(studyTab);

    expect(screen.getByText("eau")).toBeInTheDocument();
    expect(screen.queryByText("water")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Show answer" }));
    expect(await screen.findByText("water")).toBeInTheDocument();

    const grades = screen.getByRole("group", { name: "How well did you know it?" });
    await userEvent.click(within(grades).getByRole("button", { name: /Good/ }));

    expect(latest.words[0].review).toMatchObject({ repetitions: 1, intervalDays: 1 });
    expect(latest.words[1].review?.dueAt).toBe(future);
    expect(screen.getByText("All caught up")).toBeInTheDocument();
  });

  it("supports the keyboard: space reveals, 1 marks it forgotten and requeues it", async () => {
    renderDictionary([{ text: "vin" }]);
    await userEvent.click(screen.getByRole("radio", { name: /Study/ }));

    const card = screen.getByLabelText(/Flashcard/);
    card.focus();
    await userEvent.keyboard(" ");
    expect(await screen.findByText("wine")).toBeInTheDocument();
    await userEvent.keyboard("1");

    expect(latest.words[0].review).toMatchObject({ repetitions: 0, intervalDays: 0 });
    expect(screen.getByText("vin")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show answer" })).toBeInTheDocument();
  });

  it("offers to practice everything when nothing is due", async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    renderDictionary([
      { text: "eau", review: { ease: 2.5, intervalDays: 1, repetitions: 1, dueAt: future } },
    ]);
    await userEvent.click(screen.getByRole("radio", { name: /Study/ }));

    expect(screen.getByText("Next review tomorrow.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Practice 1 word" }));
    expect(screen.getByRole("button", { name: "Show answer" })).toBeInTheDocument();
  });
});

describe("Dictionary import and play all", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const q = new URL(String(input), "http://localhost").searchParams.get("q") ?? "";
        return Promise.resolve(Response.json({ text: translations[q] ?? q }));
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("imports pasted words without duplicates", async () => {
    renderDictionary([{ text: "eau" }]);
    await userEvent.click(screen.getByRole("button", { name: "Dictionary options" }));
    await userEvent.type(screen.getByLabelText("Import words"), "Eau{enter}pain{enter}vin");
    await userEvent.click(screen.getByRole("button", { name: "Add words" }));

    expect(latest.words.map((word) => word.text)).toEqual(["eau", "pain", "vin"]);
  });

  it("speaks each word and then its translation", async () => {
    const spoken: string[] = [];
    vi.stubGlobal(
      "Audio",
      class {
        playbackRate = 1;
        onended: (() => void) | null = null;
        constructor(src: string) {
          spoken.push(new URL(src, "http://localhost").searchParams.get("q") ?? "");
        }
        play() {
          queueMicrotask(() => this.onended?.());
          return Promise.resolve();
        }
        pause() {}
      }
    );
    renderDictionary([{ text: "eau" }, { text: "vin" }]);

    await userEvent.click(screen.getByRole("button", { name: "Play all" }));

    await waitFor(() => expect(spoken).toEqual(["eau", "water", "vin", "wine"]));
    await waitFor(() => expect(screen.getByRole("button", { name: "Play all" })).toBeInTheDocument());
  });
});
