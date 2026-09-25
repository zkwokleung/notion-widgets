import type { KeyboardEvent, Ref } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import LanguagePicker from "@/components/widget/LanguagePicker";
import SpeakButton from "@/components/widget/SpeakButton";
import { cn } from "@/lib/utils";
import { languageFlag, languageName } from "@/utils/lang";
import type { SpeechEntry } from "../../../shared/widgetConfigs";

const MAX_TEXT_LENGTH = 200;

interface SpeechEntryRowProps {
  entry: SpeechEntry;
  position: number;
  lang: string;
  showLanguage: boolean;
  rate: number;
  playing: boolean;
  readOnly: boolean;
  inputRef?: Ref<HTMLInputElement>;
  onTextChange: (text: string) => void;
  onLangChange: (lang: string) => void;
  onRemove: () => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
}

function SpeechEntryRow({
  entry,
  position,
  lang,
  showLanguage,
  rate,
  playing,
  readOnly,
  inputRef,
  onTextChange,
  onLangChange,
  onRemove,
  onEnter,
  onBackspaceEmpty,
}: SpeechEntryRowProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // IME composition (Chinese, Japanese, Korean input) uses Enter to commit a candidate.
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      onEnter();
    } else if (event.key === "Backspace" && entry.text === "") {
      event.preventDefault();
      onBackspaceEmpty();
    }
  };

  return (
    <li
      data-playing={playing || undefined}
      aria-current={playing || undefined}
      className={cn(
        "flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 transition-colors @md:gap-2 @md:px-2",
        playing ? "bg-accent" : "hover:bg-accent/60"
      )}
    >
      {showLanguage &&
        (readOnly ? (
          <span
            className="flex w-14 shrink-0 items-center gap-1 px-1 text-xs text-muted-foreground"
            title={languageName(lang)}
          >
            <span aria-hidden>{languageFlag(lang)}</span>
            <span className="truncate">{lang}</span>
          </span>
        ) : (
          <LanguagePicker
            compact
            value={lang}
            onChange={onLangChange}
            aria-label={`Language for entry ${position}`}
            className="border-transparent bg-transparent shadow-none hover:bg-muted dark:bg-transparent"
          />
        ))}

      {readOnly ? (
        <span className="min-w-0 flex-1 px-2.5 py-1 text-sm break-words">
          {entry.text || <span className="text-muted-foreground">Empty</span>}
        </span>
      ) : (
        <Input
          ref={inputRef}
          value={entry.text}
          maxLength={MAX_TEXT_LENGTH}
          placeholder="Type a word or phrase…"
          aria-label={`Text for entry ${position}`}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 flex-1 border-transparent bg-transparent text-sm shadow-none hover:border-transparent focus-visible:border-border focus-visible:bg-background focus-visible:ring-0 dark:bg-transparent"
        />
      )}

      <SpeakButton text={entry.text} lang={lang} rate={rate} subject={`entry ${position}`} />

      {!readOnly && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove entry ${position}`}
              onClick={onRemove}
              className="text-muted-foreground opacity-60 hover:opacity-100 focus-visible:opacity-100"
            >
              <X />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove</TooltipContent>
        </Tooltip>
      )}
    </li>
  );
}

export default SpeechEntryRow;
