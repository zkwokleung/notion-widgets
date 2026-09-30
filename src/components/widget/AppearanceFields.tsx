import { useId } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { WIDGET_COLORS, WIDGET_FONTS, type Appearance } from "../../../shared/widgetConfigs";
import { accentVars, COLORS, FONTS, isPresetColor } from "../../widgets/appearance";
import SettingChoice, { type ChoiceOption } from "./SettingChoice";

interface AppearanceFieldsProps {
  value: Appearance;
  onChange: (patch: Partial<Appearance>) => void;
}

const sizeOptions: ChoiceOption<Appearance["size"]>[] = [
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
];

const CUSTOM_COLOR_DEFAULT = "#2383e2";

function AppearanceFields({ value, onChange }: AppearanceFieldsProps) {
  const fontId = useId();
  const colorLabelId = useId();
  const customColor = isPresetColor(value.color) ? null : value.color;

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={fontId} className="font-normal">
          Font
        </Label>
        <Select value={value.font} onValueChange={(font) => onChange({ font: font as Appearance["font"] })}>
          <SelectTrigger id={fontId} size="sm" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WIDGET_FONTS.map((font) => (
              <SelectItem key={font} value={font} style={{ fontFamily: FONTS[font].family }}>
                {FONTS[font].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SettingChoice label="Size" value={value.size} options={sizeOptions} onChange={(size) => onChange({ size })} />
      <div className="flex items-center justify-between gap-4">
        <span id={colorLabelId} className="text-sm">
          Colour
        </span>
        <div role="radiogroup" aria-labelledby={colorLabelId} className="flex flex-wrap items-center gap-1.5">
          {WIDGET_COLORS.map((color) => {
            const selected = value.color === color;
            return (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={COLORS[color].label}
                style={accentVars(color)}
                onClick={() => onChange({ color })}
                className={cn(
                  "size-5 rounded-full border border-border bg-(--accent-light) outline-none dark:bg-(--accent-dark)",
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
              onChange={(event) => onChange({ color: event.target.value })}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>
    </>
  );
}

export default AppearanceFields;
