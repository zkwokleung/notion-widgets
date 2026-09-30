import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Clock } from "../../../shared/widgetConfigs";
import ZoneInput from "./ZoneInput";
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
  const name = clockName(clock);

  return (
    <li className="flex flex-wrap items-start gap-1.5">
      <ZoneInput
        value={clock.timeZone}
        listId={zoneListId}
        aria-label={`Time zone for ${name}`}
        onZoneChange={(timeZone) => onChange({ timeZone })}
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
    </li>
  );
}

export default ClockRow;
