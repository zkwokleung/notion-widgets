import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { languageFlag, languageName } from "@/utils/lang";
import type { DictWord, DictionaryConfig } from "../../../shared/widgetConfigs";
import type { WidgetProps } from "../registry";
import DictEntry from "./DictEntry";
import DictionarySettings from "./DictionarySettings";

const DEFAULT_PAIR = { from: "fr", to: "en" };

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
      {(fixedLang || !readOnly) && (
        <header className="flex min-h-9 items-center gap-2 border-b border-border pb-1">
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
            />
          )}
        </header>
      )}

      {words.length === 0 ? (
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
