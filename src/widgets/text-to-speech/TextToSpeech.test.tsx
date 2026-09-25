import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/api/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  textToSpeechConfigSchema,
  type TextToSpeechConfig,
} from "../../../shared/widgetConfigs";
import TextToSpeech from "./TextToSpeech";

class FakeAudio {
  static created: FakeAudio[] = [];
  src: string;
  playbackRate = 1;
  onplaying: (() => void) | null = null;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(src: string) {
    this.src = src;
    FakeAudio.created.push(this);
  }

  play() {
    return Promise.resolve();
  }

  pause() {}
}

const onChange = vi.fn<(next: TextToSpeechConfig) => void>();
const latestConfig = () => onChange.mock.lastCall![0];

function StatefulTextToSpeech({
  initial,
  readOnly,
}: {
  initial: TextToSpeechConfig;
  readOnly: boolean;
}) {
  const [config, setConfig] = useState(initial);
  const handleChange = (next: TextToSpeechConfig) => {
    onChange(next);
    setConfig(next);
  };
  return <TextToSpeech config={config} onChange={handleChange} readOnly={readOnly} />;
}

function renderWidget(texts: string[], { readOnly = false, fixedLang = null as string | null } = {}) {
  const initial = textToSpeechConfigSchema.parse({
    fixedLang,
    entries: texts.map((text, i) => ({ id: `e${i}`, lang: "fr", text })),
  });
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TooltipProvider>
        <StatefulTextToSpeech initial={initial} readOnly={readOnly} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const textInputs = () =>
  screen.queryAllByRole("textbox", { name: /^Text for entry/ }) as HTMLInputElement[];
const textValues = () => textInputs().map((input) => input.value);

describe("TextToSpeech", () => {
  beforeEach(() => {
    FakeAudio.created = [];
    onChange.mockClear();
    vi.stubGlobal("Audio", FakeAudio);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a hint and adds a row from the empty state", async () => {
    renderWidget([]);
    expect(screen.getByText(/Add a word or phrase/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(textValues()).toEqual([""]);
    expect(textInputs()[0]).toHaveFocus();
    expect(latestConfig().entries[0].lang).toBe("en");
  });

  it("edits an entry's text", async () => {
    renderWidget(["eau"]);
    await userEvent.type(textInputs()[0], "x");
    expect(latestConfig().entries[0].text).toBe("eaux");
  });

  it("removes the clicked row", async () => {
    renderWidget(["eau", "pain", "vin"]);
    await userEvent.click(screen.getByRole("button", { name: "Remove entry 2" }));
    expect(textValues()).toEqual(["eau", "vin"]);
  });

  it("adds and focuses a row below on Enter, inheriting the language", async () => {
    renderWidget(["eau", "vin"]);
    await userEvent.type(textInputs()[0], "{Enter}");

    expect(textValues()).toEqual(["eau", "", "vin"]);
    expect(textInputs()[1]).toHaveFocus();
    expect(latestConfig().entries[1].lang).toBe("fr");

    await userEvent.keyboard("{Backspace}");
    expect(textValues()).toEqual(["eau", "vin"]);
    expect(textInputs()[0]).toHaveFocus();
  });

  it("hides editing controls when read-only but keeps play all", () => {
    renderWidget(["eau"], { readOnly: true });

    expect(screen.getByText("eau")).toBeInTheDocument();
    expect(textInputs()).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remove/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play all" })).toBeEnabled();
  });

  it("plays non-empty entries in order and highlights the current row", async () => {
    renderWidget(["eau", "", "vin"], { fixedLang: "ja" });
    const rows = screen.getAllByRole("listitem");

    await userEvent.click(screen.getByRole("button", { name: "Play all" }));
    expect(FakeAudio.created.map((audio) => audio.src)).toEqual(["/api/tts?q=eau&tl=ja"]);
    expect(rows[0]).toHaveAttribute("aria-current", "true");

    await act(async () => FakeAudio.created[0].onended?.());
    expect(FakeAudio.created.map((audio) => audio.src)).toEqual([
      "/api/tts?q=eau&tl=ja",
      "/api/tts?q=vin&tl=ja",
    ]);
    expect(rows[2]).toHaveAttribute("aria-current", "true");

    await act(async () => FakeAudio.created[1].onended?.());
    expect(screen.getByRole("button", { name: "Play all" })).toBeInTheDocument();
    expect(rows[2]).not.toHaveAttribute("aria-current");
  });

  it("stops play all", async () => {
    renderWidget(["eau", "vin"]);
    await userEvent.click(screen.getByRole("button", { name: "Play all" }));
    await userEvent.click(screen.getByRole("button", { name: "Stop" }));

    expect(FakeAudio.created).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Play all" })).toBeInTheDocument();
  });

  it("turning off the shared language assigns it to every entry", async () => {
    renderWidget(["eau", "vin"], { fixedLang: "ja" });
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Settings" }));
    await userEvent.click(screen.getByRole("switch", { name: "Same language for all entries" }));

    expect(latestConfig().fixedLang).toBeNull();
    expect(latestConfig().entries.map((entry) => entry.lang)).toEqual(["ja", "ja"]);
  });
});
