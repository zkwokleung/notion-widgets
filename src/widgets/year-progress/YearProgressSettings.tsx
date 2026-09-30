import { useId, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import AppearanceFields from "@/components/widget/AppearanceFields";
import SettingChoice, { type ChoiceOption } from "@/components/widget/SettingChoice";
import SettingField from "@/components/widget/SettingField";
import SettingSwitch from "@/components/widget/SettingSwitch";
import {
  PROGRESS_PERIODS,
  type ProgressPeriod,
  type YearProgressConfig,
} from "../../../shared/widgetConfigs";
import { PERIOD_NAMES, sortPeriods } from "./progress";

interface YearProgressSettingsProps {
  config: YearProgressConfig;
  onChange: (next: YearProgressConfig) => void;
  children: ReactNode;
}

const styleOptions: ChoiceOption<YearProgressConfig["style"]>[] = [
  { value: "bar", label: "Bar" },
  { value: "ring", label: "Ring" },
  { value: "dots", label: "Dots" },
];
const decimalOptions: ChoiceOption<"0" | "1" | "2">[] = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
];
const weekStartOptions: ChoiceOption<YearProgressConfig["weekStart"]>[] = [
  { value: "monday", label: "Monday" },
  { value: "sunday", label: "Sunday" },
];

function YearProgressSettings({ config, onChange, children }: YearProgressSettingsProps) {
  const periodsLabelId = useId();
  const update = (patch: Partial<YearProgressConfig>) => onChange({ ...config, ...patch });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Year progress settings</DialogTitle>
          <DialogDescription className="sr-only">
            Choose which periods to track and how the progress looks.
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-3">
          <SettingField label="Title">
            {(id) => (
              <Input
                id={id}
                value={config.title}
                maxLength={80}
                placeholder="Optional"
                onChange={(event) => update({ title: event.target.value })}
              />
            )}
          </SettingField>
          <div className="flex flex-col gap-1.5">
            <span id={periodsLabelId} className="text-sm">
              Show
            </span>
            <ToggleGroup
              type="multiple"
              variant="outline"
              size="sm"
              spacing={0}
              value={config.periods}
              onValueChange={(next) => {
                const periods = sortPeriods(next as ProgressPeriod[]);
                if (periods.length > 0) update({ periods });
              }}
              aria-labelledby={periodsLabelId}
              className="flex-wrap"
            >
              {PROGRESS_PERIODS.map((period) => (
                <ToggleGroupItem key={period} value={period}>
                  {PERIOD_NAMES[period]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          {config.periods.includes("week") && (
            <SettingChoice
              label="Week starts on"
              value={config.weekStart}
              options={weekStartOptions}
              onChange={(weekStart) => update({ weekStart })}
            />
          )}
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <SettingChoice
            label="Style"
            value={config.style}
            options={styleOptions}
            onChange={(style) => update({ style })}
          />
          <SettingChoice
            label="Decimal places"
            value={String(config.decimals) as "0" | "1" | "2"}
            options={decimalOptions}
            onChange={(decimals) => update({ decimals: Number(decimals) })}
          />
          <SettingSwitch
            label="Show time left"
            checked={config.showRemaining}
            onCheckedChange={(showRemaining) => update({ showRemaining })}
          />
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <AppearanceFields value={config} onChange={update} />
        </section>
      </DialogContent>
    </Dialog>
  );
}

export default YearProgressSettings;
