import { useId } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
}

interface SettingChoiceProps<T extends string> {
  label: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
}

function SettingChoice<T extends string>({ label, value, options, onChange }: SettingChoiceProps<T>) {
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

export default SettingChoice;
