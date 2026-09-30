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
import AppearanceFields from "@/components/widget/AppearanceFields";
import SettingField from "@/components/widget/SettingField";
import SettingSwitch from "@/components/widget/SettingSwitch";
import { cn } from "@/lib/utils";
import { CLOCK_FACES, type AnalogClockConfig } from "../../../shared/widgetConfigs";
import { accentVars } from "../appearance";
import ZoneInput, { ZoneDatalist } from "../world-clock/ZoneInput";
import { viewerTimeZone } from "../world-clock/zones";
import Dial from "./Dial";
import { FACES, handAngles } from "./faces";

interface AnalogClockSettingsProps {
  config: AnalogClockConfig;
  onChange: (next: AnalogClockConfig) => void;
  children: ReactNode;
}

const PREVIEW_ANGLES = handAngles({ hours: 10, minutes: 10, seconds: 30 });

function AnalogClockSettings({ config, onChange, children }: AnalogClockSettingsProps) {
  const zoneListId = useId();
  const faceLabelId = useId();
  const update = (patch: Partial<AnalogClockConfig>) => onChange({ ...config, ...patch });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Analog clock settings</DialogTitle>
          <DialogDescription className="sr-only">
            Choose the face style, the time zone and what to show under the clock.
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
          <SettingField label="Time zone">
            {(id) => (
              <ZoneInput
                id={id}
                value={config.timeZone ?? ""}
                listId={zoneListId}
                allowEmpty
                placeholder={`Yours (${viewerTimeZone()})`}
                onZoneChange={(timeZone) => update({ timeZone: timeZone || null })}
              />
            )}
          </SettingField>
          <ZoneDatalist id={zoneListId} />
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span id={faceLabelId} className="text-sm">
              Face
            </span>
            <div role="radiogroup" aria-labelledby={faceLabelId} className="grid grid-cols-5 gap-2" style={accentVars(config.color)}>
              {CLOCK_FACES.map((face) => {
                const selected = config.face === face;
                return (
                  <button
                    key={face}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => update({ face })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs text-foreground outline-none",
                      "focus-visible:ring-3 focus-visible:ring-ring/50",
                      selected ? "border-ring bg-muted" : "border-border hover:bg-muted/50"
                    )}
                  >
                    <Dial spec={FACES[face]} angles={PREVIEW_ANGLES} showSeconds={config.showSeconds} />
                    {FACES[face].label}
                  </button>
                );
              })}
            </div>
          </div>
          <SettingSwitch
            label="Second hand"
            checked={config.showSeconds}
            onCheckedChange={(showSeconds) => update({ showSeconds })}
          />
          <SettingSwitch
            label="Show digital time"
            checked={config.showDigital}
            onCheckedChange={(showDigital) => update({ showDigital })}
          />
          <SettingSwitch
            label="Show date"
            checked={config.showDate}
            onCheckedChange={(showDate) => update({ showDate })}
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

export default AnalogClockSettings;
