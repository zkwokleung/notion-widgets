import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Delete, Eraser, Undo2 } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { recognizeHandwriting, type Stroke } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import LanguagePicker from "@/components/widget/LanguagePicker";
import SpeakButton from "@/components/widget/SpeakButton";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslation } from "@/hooks/useTranslation";
import type { WhiteboardConfig } from "../../../shared/widgetConfigs";
import type { WidgetProps } from "../registry";
import InkCanvas from "./InkCanvas";

const RECOGNIZE_DELAY_MS = 400;

// Strokes are appended immutably, so a shared prefix means "the same drawing, continued".
const isPrefix = (prefix: Stroke[], strokes: Stroke[]) =>
  prefix.length <= strokes.length && prefix.every((stroke, i) => stroke === strokes[i]);

function Whiteboard({ config, onChange }: WidgetProps<WhiteboardConfig>) {
  const { lang, translateTo, text } = config;
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [size, setSize] = useState({ width: 300, height: 200 });
  const settledStrokes = useDebounce(strokes, RECOGNIZE_DELAY_MS);
  const settledText = useDebounce(text, 600);
  const translation = useTranslation(settledText.trim(), lang, translateTo);
  const handleSizeChange = useCallback(
    (next: { width: number; height: number }) => setSize(next),
    []
  );

  const { data, isError } = useQuery({
    queryKey: ["handwriting", lang, size.width, size.height, settledStrokes] as const,
    queryFn: ({ signal }) => recognizeHandwriting(lang, size, settledStrokes, signal),
    enabled: settledStrokes.length > 0,
    staleTime: Infinity,
    // Keep showing suggestions while the same drawing grows, never a previous one's.
    placeholderData: (previous, previousQuery) =>
      previousQuery && isPrefix(previousQuery.queryKey[4], settledStrokes) ? previous : undefined,
  });
  const candidates = data && isPrefix(settledStrokes, strokes) ? data : undefined;

  const update = (patch: Partial<WhiteboardConfig>) => onChange({ ...config, ...patch });

  const accept = (candidate: string) => {
    update({ text: (text + candidate).slice(0, 500) });
    setStrokes([]);
  };

  return (
    <div className="flex flex-col gap-2 text-sm text-foreground">
      <div className="flex flex-wrap items-center gap-1">
        <LanguagePicker value={lang} onChange={(value) => update({ lang: value })} aria-label="Handwriting language" />
        <ArrowRight aria-hidden className="size-3.5 text-muted-foreground" />
        <LanguagePicker
          value={translateTo}
          onChange={(value) => update({ translateTo: value })}
          aria-label="Translate to"
        />
        <div className="ml-auto flex items-center">
          <IconAction label="Undo stroke" disabled={strokes.length === 0} onClick={() => setStrokes(strokes.slice(0, -1))}>
            <Undo2 />
          </IconAction>
          <IconAction label="Clear drawing" disabled={strokes.length === 0} onClick={() => setStrokes([])}>
            <Eraser />
          </IconAction>
        </div>
      </div>

      <div className="relative h-48 overflow-hidden rounded-md border border-border bg-muted/50">
        {strokes.length === 0 && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground select-none">
            Write a character or word here
          </span>
        )}
        <InkCanvas
          strokes={strokes}
          onStrokesChange={setStrokes}
          onSizeChange={handleSizeChange}
          aria-label="Handwriting area"
        />
      </div>

      <div className="flex min-h-9 flex-wrap items-center gap-1" aria-live="polite" aria-label="Suggestions">
        {strokes.length === 0 ? (
          <span className="text-xs text-muted-foreground">Suggestions appear as you write.</span>
        ) : isError ? (
          <span className="text-xs text-destructive">Couldn't recognize that. Try again.</span>
        ) : !candidates ? (
          <span className="text-xs text-muted-foreground">Recognizing…</span>
        ) : (
          candidates.map((candidate) => (
            <Button
              key={candidate}
              type="button"
              variant="outline"
              size="sm"
              lang={lang}
              onClick={() => accept(candidate)}
              className="text-base"
            >
              {candidate}
            </Button>
          ))
        )}
      </div>

      <div className="flex items-center gap-0.5 border-t border-border pt-2">
        <Input
          value={text}
          lang={lang}
          maxLength={500}
          aria-label="Written text"
          placeholder="Pick a suggestion, or type"
          onChange={(event) => update({ text: event.target.value })}
          className="border-transparent bg-transparent text-base shadow-none hover:bg-muted/60 focus-visible:bg-background dark:bg-transparent"
        />
        <IconAction label="Delete last character" disabled={!text} onClick={() => update({ text: [...text].slice(0, -1).join("") })}>
          <Delete />
        </IconAction>
        <SpeakButton text={text.trim()} lang={lang} subject="written text" />
      </div>
      <div className="flex min-h-8 items-center gap-0.5 px-2.5">
        <p className="flex-1 break-words text-muted-foreground" lang={translateTo}>
          <span className="sr-only">Translation: </span>
          {translation || "—"}
        </p>
        <SpeakButton text={translation} lang={translateTo} subject="translation" />
      </div>
    </div>
  );
}

function IconAction({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          className="text-muted-foreground"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export default Whiteboard;
