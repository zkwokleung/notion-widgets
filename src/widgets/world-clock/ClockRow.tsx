import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidTimeZone, type Clock } from "../../../shared/widgetConfigs";
import { cityName, clockName } from "./zones";

interface ClockRowProps {
  clock: Clock;
  zoneListId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<Clock>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

function ClockRow({ clock, zoneListId, canMoveUp, canMoveDown, canRemove, onChange, onMove, onRemove }: ClockRowProps) {
  // Typed text stays local until it names a real zone, so the saved config is always valid.
  const [draft, setDraft] = useState(clock.timeZone);
  const invalid = draft.trim() !== "" && !isValidTimeZone(draft.trim());
  const name = clockName(clock);

  const handleZone = (value: string) => {
    setDraft(value);
    const zone = value.trim();
    if (zone !== clock.timeZone && isValidTimeZone(zone)) onChange({ timeZone: zone });
  };

  return (
    <li className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <Input
          value={draft}
          list={zoneListId}
          aria-label={`Time zone for ${name}`}
          aria-invalid={invalid || undefined}
          placeholder="Region/City"
          spellCheck={false}
          autoCapitalize="off"
          onChange={(event) => handleZone(event.target.value)}
          className="min-w-36 flex-1"
        />
        <Input
          value={clock.label}
          maxLength={40}
          aria-label={`Label for ${name}`}
          placeholder={cityName(clock.timeZone)}
          onChange={(event) => onChange({ label: event.target.value })}
          className="min-w-24 flex-1"
        />
        <div className="flex items-center">
          <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${name} up`} disabled={!canMoveUp} onClick={() => onMove(-1)}>
            <ArrowUp />
          </Button>
          <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${name} down`} disabled={!canMoveDown} onClick={() => onMove(1)}>
            <ArrowDown />
          </Button>
          <Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${name}`} disabled={!canRemove} onClick={onRemove}>
            <X />
          </Button>
        </div>
      </div>
      {invalid && <p className="text-xs text-destructive">Unknown time zone. Try a name like Europe/Paris.</p>}
    </li>
  );
}

export default ClockRow;
