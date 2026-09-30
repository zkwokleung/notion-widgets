import { useMemo, useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isValidTimeZone } from "../../../shared/widgetConfigs";
import { zoneOptions } from "./zones";

interface ZoneInputProps extends Omit<ComponentProps<typeof Input>, "value" | "onChange" | "list"> {
  value: string;
  /** id of a ZoneDatalist rendered once nearby. */
  listId: string;
  /** Report a cleared field as "" instead of ignoring it. */
  allowEmpty?: boolean;
  onZoneChange: (zone: string) => void;
}

/** Typed text stays local until it names a real zone, so the saved config is always valid. */
function ZoneInput({ value, listId, allowEmpty = false, onZoneChange, className, ...props }: ZoneInputProps) {
  const [draft, setDraft] = useState(value);
  const zone = draft.trim();
  const invalid = zone !== "" && !isValidTimeZone(zone);

  const handleChange = (next: string) => {
    setDraft(next);
    const trimmed = next.trim();
    if (trimmed === value) return;
    if (isValidTimeZone(trimmed) || (allowEmpty && trimmed === "")) onZoneChange(trimmed);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Input
        value={draft}
        list={listId}
        aria-invalid={invalid || undefined}
        placeholder="Region/City"
        spellCheck={false}
        autoCapitalize="off"
        onChange={(event) => handleChange(event.target.value)}
        {...props}
      />
      {invalid && <p className="text-xs text-destructive">Unknown time zone. Try a name like Europe/Paris.</p>}
    </div>
  );
}

export function ZoneDatalist({ id }: { id: string }) {
  const zones = useMemo(() => zoneOptions(), []);
  return (
    <datalist id={id}>
      {zones.map((zone) => (
        <option key={zone} value={zone} />
      ))}
    </datalist>
  );
}

export default ZoneInput;
