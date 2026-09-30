import { Plus } from "lucide-react";
import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
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
import AppearanceFields from "@/components/widget/AppearanceFields";
import SettingChoice, { type ChoiceOption } from "@/components/widget/SettingChoice";
import SettingField from "@/components/widget/SettingField";
import SettingSwitch from "@/components/widget/SettingSwitch";
import { MAX_CLOCKS, type Clock, type WorldClockConfig } from "../../../shared/widgetConfigs";
import ClockRow from "./ClockRow";
import { ZoneDatalist } from "./ZoneInput";
import { viewerTimeZone } from "./zones";

interface WorldClockSettingsProps {
  config: WorldClockConfig;
  onChange: (next: WorldClockConfig) => void;
  children: ReactNode;
}

const layoutOptions: ChoiceOption<WorldClockConfig["layout"]>[] = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
];
const hourCycleOptions: ChoiceOption<WorldClockConfig["hourCycle"]>[] = [
  { value: "auto", label: "Auto" },
  { value: "h12", label: "12h" },
  { value: "h23", label: "24h" },
];

function WorldClockSettings({ config, onChange, children }: WorldClockSettingsProps) {
  const zoneListId = useId();
  const clocksLabelId = useId();
  const { clocks } = config;

  const update = (patch: Partial<WorldClockConfig>) => onChange({ ...config, ...patch });
  const updateClock = (id: string, patch: Partial<Clock>) =>
    update({ clocks: clocks.map((clock) => (clock.id === id ? { ...clock, ...patch } : clock)) });
  const moveClock = (index: number, direction: -1 | 1) => {
    const next = clocks.toSpliced(index, 1);
    next.splice(index + direction, 0, clocks[index]);
    update({ clocks: next });
  };
  const addClock = () =>
    update({ clocks: [...clocks, { id: crypto.randomUUID(), timeZone: viewerTimeZone(), label: "" }] });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>World clock settings</DialogTitle>
          <DialogDescription className="sr-only">
            Choose which places to show and how the clocks look.
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
            <span id={clocksLabelId} className="text-sm">
              Clocks
            </span>
            <ul aria-labelledby={clocksLabelId} className="flex flex-col gap-2">
              {clocks.map((clock, index) => (
                <ClockRow
                  key={clock.id}
                  clock={clock}
                  zoneListId={zoneListId}
                  canMoveUp={index > 0}
                  canMoveDown={index < clocks.length - 1}
                  canRemove={clocks.length > 1}
                  onChange={(patch) => updateClock(clock.id, patch)}
                  onMove={(direction) => moveClock(index, direction)}
                  onRemove={() => update({ clocks: clocks.toSpliced(index, 1) })}
                />
              ))}
            </ul>
            <ZoneDatalist id={zoneListId} />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={clocks.length >= MAX_CLOCKS}
              onClick={addClock}
              className="self-start text-muted-foreground"
            >
              <Plus />
              Add clock
            </Button>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <SettingChoice
            label="Layout"
            value={config.layout}
            options={layoutOptions}
            onChange={(layout) => update({ layout })}
          />
          <SettingChoice
            label="Hours"
            value={config.hourCycle}
            options={hourCycleOptions}
            onChange={(hourCycle) => update({ hourCycle })}
          />
          <SettingSwitch
            label="Show seconds"
            checked={config.showSeconds}
            onCheckedChange={(showSeconds) => update({ showSeconds })}
          />
          <SettingSwitch
            label="Show date"
            checked={config.showDate}
            onCheckedChange={(showDate) => update({ showDate })}
          />
          <SettingSwitch
            label="Show time difference"
            checked={config.showOffset}
            onCheckedChange={(showOffset) => update({ showOffset })}
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

export default WorldClockSettings;
