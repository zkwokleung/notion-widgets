import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

class FakeUtterance {
  text: string;
  voice: SpeechSynthesisVoice | null = null;
  lang = "";
  rate = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

function stubSpeechSynthesis(voiceLangs: string[]) {
  const spoken: FakeUtterance[] = [];
  const synth = {
    getVoices: () => voiceLangs.map((lang) => ({ lang }) as SpeechSynthesisVoice),
    speak: (utterance: FakeUtterance) => spoken.push(utterance),
    cancel: vi.fn(),
  };
  vi.stubGlobal("speechSynthesis", synth);
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
  return { spoken, synth };
}

async function loadHook() {
  vi.resetModules();
  const { useSpeech } = await import("./useSpeech");
  return renderHook(() => useSpeech());
}

describe("useSpeech", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses a matching browser voice and resolves when speech ends", async () => {
    const { spoken } = stubSpeechSynthesis(["en-US", "fr_FR"]);
    const { result } = await loadHook();

    let done = false;
    act(() => {
      void result.current.speak("bonjour", "fr", 0.8).then(() => (done = true));
    });

    expect(spoken).toHaveLength(1);
    expect(spoken[0].voice?.lang).toBe("fr_FR");
    expect(spoken[0].rate).toBe(0.8);

    act(() => spoken[0].onstart?.());
    expect(result.current.status).toBe("playing");

    await act(async () => spoken[0].onend?.());
    expect(done).toBe(true);
    expect(result.current.status).toBe("idle");
  });

  it("falls back to the Worker TTS endpoint without a matching voice", async () => {
    stubSpeechSynthesis(["en-US"]);
    const created: string[] = [];
    vi.stubGlobal(
      "Audio",
      class {
        playbackRate = 1;
        constructor(src: string) {
          created.push(src);
        }
        play() {
          return Promise.resolve();
        }
        pause() {}
      }
    );
    const { result } = await loadHook();

    act(() => {
      void result.current.speak("水", "ja");
    });

    expect(created).toEqual(["/api/tts?q=%E6%B0%B4&tl=ja"]);
    expect(result.current.status).toBe("loading");
  });
});
