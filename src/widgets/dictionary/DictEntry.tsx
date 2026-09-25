import { useState, type KeyboardEvent } from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import LanguagePicker from "@/components/widget/LanguagePicker";
import SpeakButton from "@/components/widget/SpeakButton";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { languageName } from "@/utils/lang";

const TRANSLATE_DELAY_MS = 800;

export interface DictEntryProps {
  initialText: string;
  from: string;
  to: string;
  rate: number;
  showLanguages: boolean;
  showWordSpeech: boolean;
  showTranslationSpeech: boolean;
  readOnly: boolean;
  autoFocus: boolean;
  onFromChange: (from: string) => void;
  onToChange: (to: string) => void;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  onRemove: () => void;
}

function DictEntry({
  initialText,
  from,
  to,
  rate,
  showLanguages,
  showWordSpeech,
  showTranslationSpeech,
  readOnly,
  autoFocus,
  onFromChange,
  onToChange,
  onTextChange,
  onSubmit,
  onRemove,
}: DictEntryProps) {
  // Local so typing never waits on the config round trip through the host.
  const [text, setText] = useState(initialText);
  const debouncedText = useDebounce(text.trim(), TRANSLATE_DELAY_MS);
  const translation = useTranslation(debouncedText, from, to);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Enter also confirms IME composition (Japanese, Chinese…); don't treat that as a new row.
    if (event.key !== "Enter" || event.nativeEvent.isComposing || readOnly) return;
    event.preventDefault();
    onSubmit();
  };

  return (
    <li
      className={cn(
        "grid items-center gap-x-1 gap-y-0.5 py-1.5",
        showLanguages
          ? "grid-cols-[minmax(0,1fr)_auto] [grid-template-areas:'langs_langs'_'word_remove'_'trans_.'] @lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] @lg:[grid-template-areas:'langs_word_trans_remove']"
          : "grid-cols-[minmax(0,1fr)_auto] [grid-template-areas:'word_remove'_'trans_.'] @lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] @lg:[grid-template-areas:'word_trans_remove']"
      )}
    >
      {showLanguages && (
        <div className="flex items-center gap-1 pb-1 [grid-area:langs] @lg:pb-0">
          <LanguagePicker compact value={from} onChange={onFromChange} aria-label="From language" />
          <ArrowRight aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
          <LanguagePicker compact value={to} onChange={onToChange} aria-label="To language" />
        </div>
      )}

      <div className="flex min-w-0 items-center gap-0.5 [grid-area:word]">
        <Input
          value={text}
          lang={from}
          maxLength={500}
          autoFocus={autoFocus}
          placeholder={languageName(from)}
          aria-label="Word"
          onChange={(event) => {
            setText(event.target.value);
            onTextChange(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="border-transparent bg-transparent shadow-none hover:bg-muted/60 focus-visible:bg-background dark:bg-transparent"
        />
        {showWordSpeech && <SpeakButton text={text.trim()} lang={from} rate={rate} subject="word" />}
      </div>

      <div className="flex min-w-0 items-center gap-0.5 [grid-area:trans]">
        <p className="min-h-8 min-w-0 flex-1 px-2.5 py-1.5 text-sm break-words">
          <span className="sr-only">Translation: </span>
          {translation ? (
            <span lang={to}>{translation}</span>
          ) : (
            <span aria-hidden className="text-muted-foreground/60">
              {text.trim() ? "…" : "—"}
            </span>
          )}
        </p>
        {showTranslationSpeech && <SpeakButton text={translation} lang={to} rate={rate} subject="translation" />}
      </div>

      {!readOnly && (
        <div className="self-start [grid-area:remove] @lg:self-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove word"
                onClick={onRemove}
                className="text-muted-foreground opacity-60 hover:opacity-100 focus-visible:opacity-100"
              >
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove word</TooltipContent>
          </Tooltip>
        </div>
      )}
    </li>
  );
}

export default DictEntry;
