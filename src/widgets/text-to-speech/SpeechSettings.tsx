import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import LanguagePicker from "@/components/widget/LanguagePicker";
import type { TextToSpeechConfig } from "../../../shared/widgetConfigs";
import { formatRate } from "./formatRate";

interface SpeechSettingsProps {
  config: TextToSpeechConfig;
  onChange: (next: TextToSpeechConfig) => void;
}

function SpeechSettings({ config, onChange }: SpeechSettingsProps) {
  const { fixedLang, rate, entries } = config;

  const handleSameLanguage = (checked: boolean) => {
    if (checked) {
      onChange({ ...config, fixedLang: entries.at(-1)?.lang ?? "en" });
      return;
    }
    onChange({
      ...config,
      fixedLang: null,
      entries: fixedLang ? entries.map((entry) => ({ ...entry, lang: fixedLang })) : entries,
    });
  };

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Settings"
              className="text-muted-foreground"
            >
              <Settings2 />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Speech settings</DialogTitle>
          <DialogDescription>Applies to every entry in this list.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <Label id="tts-rate-label">Speed</Label>
            <span className="text-sm text-muted-foreground tabular-nums">{formatRate(rate)}</span>
          </div>
          <Slider
            aria-labelledby="tts-rate-label"
            min={0.5}
            max={2}
            step={0.25}
            value={[rate]}
            onValueChange={([next]) => onChange({ ...config, rate: next })}
          />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="tts-same-language">Same language for all entries</Label>
            <Switch
              id="tts-same-language"
              checked={fixedLang !== null}
              onCheckedChange={handleSameLanguage}
            />
          </div>
          {fixedLang !== null && (
            <LanguagePicker
              value={fixedLang}
              onChange={(lang) => onChange({ ...config, fixedLang: lang })}
              aria-label="Language for all entries"
              className="w-full"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SpeechSettings;
