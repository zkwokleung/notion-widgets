import { useEffect, useRef, useState } from "react";
import { Play, Plus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/useSpeech";
import type { SpeechEntry, TextToSpeechConfig } from "../../../shared/widgetConfigs";
import type { WidgetProps } from "../registry";
import SpeechEntryRow from "./SpeechEntryRow";
import { formatRate } from "./formatRate";
import SpeechSettings from "./SpeechSettings";

interface PlaybackRun {
  cancelled: boolean;
}

function TextToSpeech({ config, onChange, readOnly }: WidgetProps<TextToSpeechConfig>) {
  const { fixedLang, rate, entries } = config;
  const { speak, stop } = useSpeech();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playback = useRef<PlaybackRun | null>(null);
  const inputs = useRef(new Map<string, HTMLInputElement>());
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => {
    if (!pendingFocus.current) return;
    inputs.current.get(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });

  useEffect(
    () => () => {
      if (playback.current) playback.current.cancelled = true;
    },
    []
  );

  const langOf = (entry: SpeechEntry) => fixedLang ?? entry.lang;
  const playable = entries.filter((entry) => entry.text.trim() !== "");

  const updateEntry = (id: string, patch: Partial<SpeechEntry>) => {
    onChange({
      ...config,
      entries: entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    });
  };

  const insertEntry = (index: number) => {
    const entry: SpeechEntry = {
      id: crypto.randomUUID(),
      lang: fixedLang ?? entries[index - 1]?.lang ?? entries.at(-1)?.lang ?? "en",
      text: "",
    };
    pendingFocus.current = entry.id;
    onChange({ ...config, entries: entries.toSpliced(index, 0, entry) });
  };

  const removeEntry = (index: number, focusNeighbour = false) => {
    if (focusNeighbour) {
      pendingFocus.current = (entries[index - 1] ?? entries[index + 1])?.id ?? null;
    }
    onChange({ ...config, entries: entries.toSpliced(index, 1) });
  };

  const stopAll = () => {
    if (playback.current) playback.current.cancelled = true;
    playback.current = null;
    stop();
    setPlayingId(null);
  };

  const playAll = async () => {
    stopAll();
    const run: PlaybackRun = { cancelled: false };
    playback.current = run;
    for (const entry of playable) {
      if (run.cancelled) return;
      setPlayingId(entry.id);
      const completed = await speak(entry.text, langOf(entry), rate);
      if (!completed) break;
    }
    if (run.cancelled) return;
    playback.current = null;
    setPlayingId(null);
  };

  const isPlayingAll = playingId !== null;

  return (
    <div className="@container flex flex-col gap-1 text-sm text-foreground">
      {entries.length === 0 ? (
        <p className="px-2 py-3 text-muted-foreground">
          {readOnly
            ? "Nothing to listen to yet."
            : "Add a word or phrase, then press listen to hear it."}
        </p>
      ) : (
        <ul aria-label="Entries" className="flex flex-col">
          {entries.map((entry, index) => (
            <SpeechEntryRow
              key={entry.id}
              entry={entry}
              position={index + 1}
              lang={langOf(entry)}
              showLanguage={fixedLang === null}
              rate={rate}
              playing={entry.id === playingId}
              readOnly={readOnly}
              inputRef={(element) => {
                if (element) inputs.current.set(entry.id, element);
                return () => {
                  inputs.current.delete(entry.id);
                };
              }}
              onTextChange={(text) => updateEntry(entry.id, { text })}
              onLangChange={(lang) => updateEntry(entry.id, { lang })}
              onRemove={() => removeEntry(index)}
              onEnter={() => insertEntry(index + 1)}
              onBackspaceEmpty={() => {
                if (entries.length > 1) removeEntry(index, true);
              }}
            />
          ))}
        </ul>
      )}

      {!(readOnly && playable.length === 0) && (
        <div className="flex flex-wrap items-center gap-1 border-t border-border pt-1">
          {!readOnly && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertEntry(entries.length)}
              className="text-muted-foreground"
            >
              <Plus />
              Add
            </Button>
          )}
          <div className="ml-auto flex items-center gap-1">
            {rate !== 1 && (
              <span className="px-1 text-xs text-muted-foreground tabular-nums" title="Speed">
                {formatRate(rate)}
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!isPlayingAll && playable.length === 0}
              onClick={() => (isPlayingAll ? stopAll() : void playAll())}
              className="text-muted-foreground"
            >
              {isPlayingAll ? <Square className="fill-current" /> : <Play />}
              {isPlayingAll ? "Stop" : "Play all"}
            </Button>
            {!readOnly && <SpeechSettings config={config} onChange={onChange} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default TextToSpeech;
