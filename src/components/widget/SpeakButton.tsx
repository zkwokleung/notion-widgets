import { LoaderCircle, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSpeech } from "@/hooks/useSpeech";

interface SpeakButtonProps {
  text: string;
  lang: string;
  rate?: number;
  /** What is spoken, for screen readers, e.g. "word" gives "Listen to word". */
  subject?: string;
}

function SpeakButton({ text, lang, rate, subject }: SpeakButtonProps) {
  const { status, speak, stop } = useSpeech();
  const busy = status !== "idle";
  const tooltip = busy ? "Stop" : "Listen";
  const label = !subject ? tooltip : busy ? `Stop ${subject}` : `Listen to ${subject}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          disabled={!text && !busy}
          onClick={() => (busy ? stop() : void speak(text, lang, rate))}
          className="text-muted-foreground"
        >
          {status === "loading" ? (
            <LoaderCircle className="animate-spin" />
          ) : status === "playing" ? (
            <Square className="fill-current" />
          ) : (
            <Volume2 />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export default SpeakButton;
