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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import SettingSwitch from "@/components/widget/SettingSwitch";
import { cn } from "@/lib/utils";
import {
  COUNTDOWN_COLORS,
  COUNTDOWN_FONTS,
  type CountdownConfig,
} from "../../../shared/widgetConfigs";
import { encodeTarget, isSharedInstant, resolveTarget, toLocalInput } from "./duration";
import { accentVars, COLORS, FONTS, isPresetColor } from "./styles";

interface CountdownSettingsProps {
  config: CountdownConfig;
  onChange: (next: CountdownConfig) => void;
  children: ReactNode;
}

interface Option<T extends string> {
  value: T;
  label: string;
}

const afterEndOptions: Option<CountdownConfig["afterEnd"]>[] = [
  { value: "message", label: "Show a message" },
  { value: "countUp", label: "Count up" },
];
const layoutOptions: Option<CountdownConfig["layout"]>[] = [
  { value: "tiles", label: "Tiles" },
  { value: "plain", label: "Plain" },
  { value: "inline", label: "Inline" },
];
const precisionOptions: Option<CountdownConfig["precision"]>[] = [
  { value: "days", label: "Days" },
  { value: "hours", label: "Hours" },
  { value: "minutes", label: "Minutes" },
  { value: "seconds", label: "Seconds" },
];
const labelOptions: Option<CountdownConfig["labels"]>[] = [
  { value: "long", label: "Full" },
  { value: "short", label: "Short" },
  { value: "none", label: "None" },
];
const sizeOptions: Option<CountdownConfig["size"]>[] = [
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
];

const CUSTOM_COLOR_DEFAULT = "#2383e2";

/** A label above its control; `children` gets the id to attach. */
function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
      {children(id)}
    </div>
  );
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  const labelId = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <span id={labelId} className="text-sm">
        {label}
      </span>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={0}
        value={value}
        onValueChange={(next) => {
          if (options.some((option) => option.value === next)) onChange(next as T);
        }}
        aria-labelledby={labelId}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function CountdownSettings({ config, onChange, children }: CountdownSettingsProps) {
  const colorLabelId = useId();
  const update = (patch: Partial<CountdownConfig>) => onChange({ ...config, ...patch });

  const targetMs = resolveTarget(config.target);
  const hasTarget = !Number.isNaN(targetMs);
  const shared = isSharedInstant(config.target);
  const customColor = isPresetColor(config.color) ? null : config.color;

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
          <Field label="Title">
            {(id) => (
              <Input
                id={id}
                value={config.title}
                maxLength={80}
                onChange={(event) => update({ title: event.target.value })}
              />
            )}
          </Field>
          <Field label="Date and time">
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
          </Field>
          <SettingSwitch
            label="Same moment for every viewer"
            checked={shared}
            onCheckedChange={(on) => {
              if (hasTarget) update({ target: encodeTarget(toLocalInput(targetMs), on) });
            }}
          />
          <Choice
            label="When it ends"
            value={config.afterEnd}
            options={afterEndOptions}
            onChange={(afterEnd) => update({ afterEnd })}
          />
          {config.afterEnd === "message" && (
            <Field label="Message">
              {(id) => (
                <Input
                  id={id}
                  value={config.doneMessage}
                  maxLength={120}
                  onChange={(event) => update({ doneMessage: event.target.value })}
                />
              )}
            </Field>
          )}
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <Choice
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
          <Choice
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
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="countdown-font" className="font-normal">
              Font
            </Label>
            <Select
              value={config.font}
              onValueChange={(font) => update({ font: font as CountdownConfig["font"] })}
            >
              <SelectTrigger id="countdown-font" size="sm" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTDOWN_FONTS.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: FONTS[font].family }}>
                    {FONTS[font].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Choice
            label="Size"
            value={config.size}
            options={sizeOptions}
            onChange={(size) => update({ size })}
          />
          <div className="flex items-center justify-between gap-4">
            <span id={colorLabelId} className="text-sm">
              Colour
            </span>
            <div role="radiogroup" aria-labelledby={colorLabelId} className="flex flex-wrap items-center gap-1.5">
              {COUNTDOWN_COLORS.map((color) => {
                const selected = config.color === color;
                return (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={COLORS[color].label}
                    style={accentVars(color)}
                    onClick={() => update({ color })}
                    className={cn(
                      "size-5 rounded-full border border-border bg-(--cd-light) outline-none dark:bg-(--cd-dark)",
                      "focus-visible:ring-3 focus-visible:ring-ring/50",
                      selected && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                    )}
                  />
                );
              })}
              <label
                className={cn(
                  "relative size-5 cursor-pointer overflow-hidden rounded-full border border-border",
                  customColor && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                )}
                style={{ background: customColor ?? "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
              >
                <input
                  type="color"
                  aria-label="Custom colour"
                  value={customColor ?? CUSTOM_COLOR_DEFAULT}
                  onChange={(event) => update({ color: event.target.value })}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

export default CountdownSettings;
