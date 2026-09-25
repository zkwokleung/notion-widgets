import { useId, useRef, useState } from "react";
import { Download, FileUp, Settings2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import LanguagePicker from "@/components/widget/LanguagePicker";
import type { DictionaryConfig } from "../../../shared/widgetConfigs";

type LangPair = NonNullable<DictionaryConfig["fixedLang"]>;

interface DictionarySettingsProps {
  config: DictionaryConfig;
  onHideOriginTTSChange: (hide: boolean) => void;
  onHideTranslatedTTSChange: (hide: boolean) => void;
  onFixedLangToggle: (enabled: boolean) => void;
  onFixedLangChange: (pair: LangPair) => void;
  onRateChange: (rate: number) => void;
  /** Returns how many words were added. */
  onImport: (text: string) => number;
  onExport: () => Promise<void>;
  onResetProgress: () => void;
}

function SettingSwitch({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function DictionarySettings({
  config,
  onHideOriginTTSChange,
  onHideTranslatedTTSChange,
  onFixedLangToggle,
  onFixedLangChange,
  onRateChange,
  onImport,
  onExport,
  onResetProgress,
}: DictionarySettingsProps) {
  const speedLabelId = useId();
  const importId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState("");
  const [exporting, setExporting] = useState(false);
  const studied = config.words.some((word) => word.review);
  const { fixedLang } = config;

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Dictionary options"
              className="text-muted-foreground"
            >
              <Settings2 />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Options</TooltipContent>
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dictionary options</DialogTitle>
          <DialogDescription className="sr-only">
            Choose languages, listen buttons, speech speed, and import or export words.
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-3">
          <SettingSwitch
            label="Same languages for all entries"
            checked={!!fixedLang}
            onCheckedChange={onFixedLangToggle}
          />
          {fixedLang && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">From</span>
                <LanguagePicker
                  value={fixedLang.from}
                  onChange={(from) => onFixedLangChange({ ...fixedLang, from })}
                  aria-label="From language"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">To</span>
                <LanguagePicker
                  value={fixedLang.to}
                  onChange={(to) => onFixedLangChange({ ...fixedLang, to })}
                  aria-label="To language"
                  className="w-full"
                />
              </div>
            </div>
          )}
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <SettingSwitch
            label="Hide listen button for words"
            checked={config.hideOriginTTS}
            onCheckedChange={onHideOriginTTSChange}
          />
          <SettingSwitch
            label="Hide listen button for translations"
            checked={config.hideTranslatedTTS}
            onCheckedChange={onHideTranslatedTTSChange}
          />
        </section>

        <Separator />

        <section role="group" aria-labelledby={speedLabelId} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span id={speedLabelId} className="text-sm">
              Speech speed
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">{config.rate}×</span>
          </div>
          <Slider
            min={0.5}
            max={2}
            step={0.25}
            value={[config.rate]}
            onValueChange={([rate]) => {
              if (rate !== undefined) onRateChange(rate);
            }}
          />
        </section>

        <Separator />

        <section className="flex flex-col gap-2">
          <Label htmlFor={importId}>Import words</Label>
          <Textarea
            id={importId}
            rows={3}
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder={"One word per line, or CSV/TSV:\nword,translation,from,to"}
            className="text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!importText.trim()}
              onClick={() => {
                if (onImport(importText) > 0) setImportText("");
              }}
            >
              Add words
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInput.current?.click()}
            >
              <FileUp />
              From file…
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void file.text().then(onImport);
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="ml-auto"
              disabled={exporting || config.words.length === 0}
              onClick={() => {
                setExporting(true);
                void onExport().finally(() => setExporting(false));
              }}
            >
              <Download />
              Export CSV
            </Button>
          </div>
        </section>

        {studied && (
          <>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Study progress is saved per word.</span>
              <Button type="button" size="sm" variant="destructive" onClick={onResetProgress}>
                Reset progress
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default DictionarySettings;
