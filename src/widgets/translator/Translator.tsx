import { ArrowLeftRight, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import LanguagePicker from "@/components/widget/LanguagePicker";
import SpeakButton from "@/components/widget/SpeakButton";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslation } from "@/hooks/useTranslation";
import { supportedLanguages } from "@/utils/lang";
import type { TranslatorConfig } from "../../../shared/widgetConfigs";
import type { WidgetProps } from "../registry";
import ActionButton from "./ActionButton";
import TranslationRow from "./TranslationRow";

export default function Translator({
  config,
  onChange,
  readOnly,
}: WidgetProps<TranslatorConfig>) {
  const { from, to } = config;
  const [text, setText] = useState("");
  const settledText = useDebounce(text, 500);
  const [firstTarget] = to;
  const firstTranslation = useTranslation(settledText, from, firstTarget ?? "");

  const used = new Set([from, ...to]);
  const unusedLanguages = supportedLanguages.filter((lang) => !used.has(lang));

  const handleFromChange = (value: string) => {
    onChange({ from: value, to: to.filter((lang) => lang !== value) });
  };

  const handleSwap = () => {
    if (!firstTarget) return;
    if (text === settledText && firstTranslation) setText(firstTranslation);
    onChange({ from: firstTarget, to: [from, ...to.slice(1)] });
  };

  const handleTargetChange = (lang: string, next: string) => {
    onChange({ from, to: to.map((current) => (current === lang ? next : current)) });
  };

  const handleAdd = () => {
    const [next] = unusedLanguages;
    if (next) onChange({ from, to: [...to, next] });
  };

  const handleRemove = (lang: string) => {
    onChange({ from, to: to.filter((current) => current !== lang) });
  };

  return (
    <div className="@container flex flex-col gap-1 text-sm text-foreground">
      <div className="rounded-md border border-border transition-colors focus-within:border-ring">
        <div className="flex flex-wrap items-center gap-1 px-1.5 pt-1.5">
          <LanguagePicker
            value={from}
            onChange={handleFromChange}
            disabled={readOnly}
            aria-label="Source language"
          />
          {!readOnly && (
            <ActionButton
              label="Swap languages"
              onClick={handleSwap}
              disabled={!firstTarget}
            >
              <ArrowLeftRight />
            </ActionButton>
          )}
          <div className="ml-auto flex items-center opacity-70 transition-opacity focus-within:opacity-100 hover:opacity-100">
            <SpeakButton text={text} lang={from} subject="source text" />
          </div>
        </div>
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Text to translate"
          placeholder="Type something to translate…"
          className="min-h-20 resize-none rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </div>

      {to.length > 0 && (
        <ul aria-label="Translations" className="divide-y divide-border">
          {to.map((lang) => (
            <TranslationRow
              key={lang}
              text={settledText}
              from={from}
              lang={lang}
              languages={supportedLanguages.filter(
                (code) => code === lang || !used.has(code)
              )}
              readOnly={readOnly}
              onLangChange={(next) => handleTargetChange(lang, next)}
              onRemove={() => handleRemove(lang)}
            />
          ))}
        </ul>
      )}

      {!readOnly && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAdd}
          disabled={unusedLanguages.length === 0}
          className="self-start text-muted-foreground"
        >
          <Plus data-icon="inline-start" />
          Add language
        </Button>
      )}
    </div>
  );
}
