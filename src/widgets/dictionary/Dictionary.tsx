import { useEffect, useRef, useState } from "react";
import { BookOpen, GraduationCap, List, Play, Plus, Square } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSpeech } from "@/hooks/useSpeech";
import { useFetchTranslation } from "@/hooks/useTranslation";
import { downloadTextFile } from "@/lib/csv";
import { dueItems } from "@/lib/srs";
import { languageFlag, languageName } from "@/utils/lang";
import type { DictWord, DictionaryConfig } from "../../../shared/widgetConfigs";
import type { WidgetProps } from "../registry";
import { MAX_WORDS, wordsFromText, wordsToCsv } from "./csvTransfer";
import DictEntry from "./DictEntry";
import DictionarySettings from "./DictionarySettings";
import StudyMode from "./StudyMode";

const DEFAULT_PAIR = { from: "fr", to: "en" };

type Mode = "list" | "study";

function LanguagePair({ from, to }: { from: string; to: string }) {
  return (
    <p className="truncate text-sm text-muted-foreground">
      <span aria-hidden>{languageFlag(from)} </span>
      {languageName(from)}
      <span aria-hidden> → </span>
      <span className="sr-only"> to </span>
      <span aria-hidden>{languageFlag(to)} </span>
      {languageName(to)}
    </p>
  );
}

function Dictionary({ config, onChange, readOnly }: WidgetProps<DictionaryConfig>) {
  const { fixedLang, words } = config;
  const [focusId, setFocusId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("list");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playback = useRef<{ cancelled: boolean } | null>(null);
  const { speak, stop } = useSpeech();
  const fetchTranslation = useFetchTranslation();

  useEffect(
    () => () => {
      if (playback.current) playback.current.cancelled = true;
    },
    []
  );

  // What each word is actually studied and spoken as, with the shared pair applied.
  const effectiveWords = fixedLang
    ? words.map((word) => ({ ...word, from: fixedLang.from, to: fixedLang.to }))
    : words;
  const withText = effectiveWords.filter((word) => word.text.trim());
  const dueCount = dueItems(withText, new Date()).length;

  const update = (patch: Partial<DictionaryConfig>) => onChange({ ...config, ...patch });

  const updateWord = (id: string, patch: Partial<DictWord>) => {
    update({ words: words.map((word) => (word.id === id ? { ...word, ...patch } : word)) });
  };

  const insertWord = (index: number) => {
    const pair = fixedLang ?? words[index - 1] ?? words.at(-1) ?? DEFAULT_PAIR;
    const word: DictWord = { id: crypto.randomUUID(), from: pair.from, to: pair.to, text: "" };
    update({ words: words.toSpliced(index, 0, word) });
    setFocusId(word.id);
  };

  const handleFixedLangToggle = (enabled: boolean) => {
    if (enabled) {
      update({ fixedLang: words[0] ? { from: words[0].from, to: words[0].to } : DEFAULT_PAIR });
    } else {
      // Keep the pair that was in effect instead of reverting to each word's old one.
      const pair = fixedLang ?? DEFAULT_PAIR;
      update({
        fixedLang: null,
        words: words.map((word) => ({ ...word, from: pair.from, to: pair.to })),
      });
    }
  };

  const handleImport = (text: string) => {
    const imported = wordsFromText(text, fixedLang ?? words.at(-1) ?? DEFAULT_PAIR, words);
    if (imported.length === 0) {
      toast(
        words.length >= MAX_WORDS
          ? `A dictionary holds up to ${MAX_WORDS} words.`
          : "No new words found."
      );
      return 0;
    }
    update({ words: [...words, ...imported] });
    toast.success(`Added ${imported.length} ${imported.length === 1 ? "word" : "words"}.`);
    return imported.length;
  };

  const handleExport = async () => {
    const translations = await Promise.all(
      effectiveWords.map((word) =>
        fetchTranslation(word.text.trim(), word.from, word.to).catch(() => "")
      )
    );
    downloadTextFile("dictionary.csv", wordsToCsv(effectiveWords, translations));
  };

  const stopPlayback = () => {
    if (playback.current) playback.current.cancelled = true;
    playback.current = null;
    stop();
    setPlayingId(null);
  };

  const playAll = async () => {
    stopPlayback();
    const run = { cancelled: false };
    playback.current = run;
    for (const word of withText) {
      setPlayingId(word.id);
      const text = word.text.trim();
      if (!(await speak(text, word.from, config.rate)) || run.cancelled) break;
      const translation = await fetchTranslation(text, word.from, word.to).catch(() => "");
      if (run.cancelled || !(await speak(translation, word.to, config.rate))) break;
    }
    if (run.cancelled) return;
    playback.current = null;
    setPlayingId(null);
  };

  const addButton = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label="Add word"
      onClick={() => insertWord(words.length)}
      className="text-muted-foreground"
    >
      <Plus />
      Add word
    </Button>
  );

  return (
    <div className="@container flex flex-col bg-background text-sm text-foreground">
      <header className="flex min-h-9 items-center gap-2 border-b border-border pb-1">
        {withText.length > 0 && (
          <ToggleGroup
            type="single"
            size="sm"
            value={mode}
            onValueChange={(value) => {
              if (!value) return;
              stopPlayback();
              setMode(value as Mode);
            }}
            aria-label="View"
          >
            <ToggleGroupItem value="list" className="gap-1 px-2 text-xs">
              <List />
              List
            </ToggleGroupItem>
            <ToggleGroupItem value="study" className="gap-1 px-2 text-xs">
              <GraduationCap />
              Study
              {dueCount > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[0.65rem] tabular-nums">
                  {dueCount}
                  <span className="sr-only"> due</span>
                </Badge>
              )}
            </ToggleGroupItem>
          </ToggleGroup>
        )}
        <div className="min-w-0 flex-1">
          {fixedLang && <LanguagePair from={fixedLang.from} to={fixedLang.to} />}
        </div>
        {!readOnly && (
          <DictionarySettings
            config={config}
            onHideOriginTTSChange={(hideOriginTTS) => update({ hideOriginTTS })}
            onHideTranslatedTTSChange={(hideTranslatedTTS) => update({ hideTranslatedTTS })}
            onFixedLangToggle={handleFixedLangToggle}
            onFixedLangChange={(pair) => update({ fixedLang: pair })}
            onRateChange={(rate) => update({ rate })}
            onImport={handleImport}
            onExport={handleExport}
            onResetProgress={() => update({ words: words.map((word) => ({ ...word, review: undefined })) })}
          />
        )}
      </header>

      {mode === "study" && withText.length > 0 ? (
        <StudyMode
          words={effectiveWords}
          rate={config.rate}
          onReview={(id, review) => updateWord(id, { review })}
        />
      ) : words.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <BookOpen aria-hidden className="size-5 text-muted-foreground" />
          <p className="text-muted-foreground">
            {readOnly
              ? "This dictionary has no words yet."
              : "Add words to build your vocabulary list. Translations appear as you type."}
          </p>
          {!readOnly && addButton}
        </div>
      ) : (
        <>
          <ul aria-label="Words" className="divide-y divide-border">
            {words.map((word, index) => (
              <DictEntry
                key={word.id}
                initialText={word.text}
                from={fixedLang?.from ?? word.from}
                to={fixedLang?.to ?? word.to}
                rate={config.rate}
                showLanguages={!fixedLang}
                showWordSpeech={!config.hideOriginTTS}
                showTranslationSpeech={!config.hideTranslatedTTS}
                readOnly={readOnly}
                autoFocus={word.id === focusId}
                playing={word.id === playingId}
                onFromChange={(from) => updateWord(word.id, { from })}
                onToChange={(to) => updateWord(word.id, { to })}
                onTextChange={(text) => updateWord(word.id, { text })}
                onSubmit={() => insertWord(index + 1)}
                onRemove={() => update({ words: words.filter(({ id }) => id !== word.id) })}
              />
            ))}
          </ul>
          <footer className="flex min-h-9 items-center gap-2 border-t border-border pt-1">
            {!readOnly && addButton}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!playingId && withText.length === 0}
              onClick={() => (playingId ? stopPlayback() : void playAll())}
              className="text-muted-foreground"
            >
              {playingId ? <Square className="fill-current" /> : <Play />}
              {playingId ? "Stop" : "Play all"}
            </Button>
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {words.length} {words.length === 1 ? "word" : "words"}
            </span>
          </footer>
        </>
      )}
    </div>
  );
}

export default Dictionary;
