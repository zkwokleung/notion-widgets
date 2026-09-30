import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import AppearanceFields from "@/components/widget/AppearanceFields";
import SettingChoice, { type ChoiceOption } from "@/components/widget/SettingChoice";
import SettingField from "@/components/widget/SettingField";
import SettingSwitch from "@/components/widget/SettingSwitch";
import type { CountdownConfig } from "../../../shared/widgetConfigs";
import { encodeTarget, isSharedInstant, resolveTarget, toLocalInput } from "./duration";

interface CountdownSettingsProps {
  config: CountdownConfig;
  onChange: (next: CountdownConfig) => void;
  children: ReactNode;
}

const afterEndOptions: ChoiceOption<CountdownConfig["afterEnd"]>[] = [
  { value: "message", label: "Show a message" },
  { value: "countUp", label: "Count up" },
];
const layoutOptions: ChoiceOption<CountdownConfig["layout"]>[] = [
  { value: "tiles", label: "Tiles" },
  { value: "plain", label: "Plain" },
  { value: "inline", label: "Inline" },
];
const precisionOptions: ChoiceOption<CountdownConfig["precision"]>[] = [
  { value: "days", label: "Days" },
  { value: "hours", label: "Hours" },
  { value: "minutes", label: "Minutes" },
  { value: "seconds", label: "Seconds" },
];
const labelOptions: ChoiceOption<CountdownConfig["labels"]>[] = [
  { value: "long", label: "Full" },
  { value: "short", label: "Short" },
  { value: "none", label: "None" },
];

function CountdownSettings({ config, onChange, children }: CountdownSettingsProps) {
  const update = (patch: Partial<CountdownConfig>) => onChange({ ...config, ...patch });

  const targetMs = resolveTarget(config.target);
  const hasTarget = !Number.isNaN(targetMs);
  const shared = isSharedInstant(config.target);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Countdown settings</DialogTitle>
          <DialogDescription className="sr-only">
            Choose the date, what to show when it arrives, and how the countdown looks.
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-3">
          <SettingField label="Title">
            {(id) => (
              <Input
                id={id}
                value={config.title}
                maxLength={80}
                onChange={(event) => update({ title: event.target.value })}
              />
            )}
          </SettingField>
          <SettingField label="Date and time">
            {(id) => (
              <Input
                id={id}
                type="datetime-local"
                step={60}
                value={hasTarget ? toLocalInput(targetMs) : ""}
                onChange={(event) => {
                  if (event.target.value) update({ target: encodeTarget(event.target.value, shared) });
                }}
              />
            )}
          </SettingField>
          <SettingSwitch
            label="Same moment for every viewer"
            checked={shared}
            onCheckedChange={(on) => {
              if (hasTarget) update({ target: encodeTarget(toLocalInput(targetMs), on) });
            }}
          />
          <SettingChoice
            label="When it ends"
            value={config.afterEnd}
            options={afterEndOptions}
            onChange={(afterEnd) => update({ afterEnd })}
          />
          {config.afterEnd === "message" && (
            <SettingField label="Message">
              {(id) => (
                <Input
                  id={id}
                  value={config.doneMessage}
                  maxLength={120}
                  onChange={(event) => update({ doneMessage: event.target.value })}
                />
              )}
            </SettingField>
          )}
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <SettingChoice
            label="Layout"
            value={config.layout}
            options={layoutOptions}
            onChange={(layout) => update({ layout })}
          />
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="countdown-precision" className="font-normal">
              Show down to
            </Label>
            <Select
              value={config.precision}
              onValueChange={(precision) => update({ precision: precision as CountdownConfig["precision"] })}
            >
              <SelectTrigger id="countdown-precision" size="sm" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {precisionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SettingChoice
            label="Labels"
            value={config.labels}
            options={labelOptions}
            onChange={(labels) => update({ labels })}
          />
          <SettingSwitch
            label="Leading zeros"
            checked={config.padZero}
            onCheckedChange={(padZero) => update({ padZero })}
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

export default CountdownSettings;
