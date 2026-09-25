import { useCallback, useEffect, useRef, useState } from "react";
import { ttsUrl } from "../api/client";

export type SpeechStatus = "idle" | "loading" | "playing";

const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;

function findVoice(lang: string): SpeechSynthesisVoice | undefined {
  const target = lang.toLowerCase();
  const base = target.split("-")[0];
  const voices = synth?.getVoices() ?? [];
  const normalized = (voice: SpeechSynthesisVoice) =>
    voice.lang.toLowerCase().replace("_", "-");

  return (
    voices.find((voice) => normalized(voice) === target) ??
    voices.find((voice) => normalized(voice).split("-")[0] === base)
  );
}

// Only one thing speaks at a time across the page; starting speech stops the rest.
let stopActive: (() => void) | null = null;

/**
 * Speaks with a browser voice when one exists for the language, otherwise
 * streams Google TTS through the Worker. `speak` resolves to true when playback
 * finishes on its own and false when it's stopped or interrupted, so callers
 * chaining entries know when to stop.
 */
export function useSpeech() {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const stopCurrent = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    stopCurrent.current?.();
    stopCurrent.current = null;
  }, []);

  const speak = useCallback(
    (text: string, lang: string, rate = 1) =>
      new Promise<boolean>((resolve) => {
        stopActive?.();
        if (!text || !lang) return resolve(false);

        let finished = false;
        const finish = (completed: boolean) => {
          if (finished) return;
          finished = true;
          stopCurrent.current = null;
          if (stopActive === interrupt) stopActive = null;
          setStatus("idle");
          resolve(completed);
        };
        let cancelPlayback = () => {};
        const interrupt = () => {
          finish(false);
          cancelPlayback();
        };
        stopCurrent.current = interrupt;
        stopActive = interrupt;
        setStatus("loading");

        const voice = findVoice(lang);
        if (synth && voice) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.voice = voice;
          utterance.lang = voice.lang;
          utterance.rate = rate;
          utterance.onstart = () => setStatus("playing");
          utterance.onend = () => finish(true);
          utterance.onerror = () => finish(false);
          cancelPlayback = () => synth.cancel();
          synth.speak(utterance);
          return;
        }

        const audio = new Audio(ttsUrl(text, lang));
        audio.playbackRate = rate;
        audio.onplaying = () => setStatus("playing");
        audio.onended = () => finish(true);
        audio.onerror = () => finish(false);
        cancelPlayback = () => audio.pause();
        audio.play().catch(() => finish(false));
      }),
    []
  );

  useEffect(() => {
    // Chrome loads voices lazily; asking early makes the first speak() find them.
    synth?.getVoices();
    return stop;
  }, [stop]);

  return { status, speak, stop };
}
