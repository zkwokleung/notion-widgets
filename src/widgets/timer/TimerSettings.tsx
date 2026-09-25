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
import type { TimerConfig } from "../../../shared/widgetConfigs";

const FIELDS: { key: keyof TimerConfig; label: string; min: number; max: number }[] = [
  { key: "focusMinutes", label: "Focus (minutes)", min: 1, max: 180 },
  { key: "shortBreakMinutes", label: "Short break (minutes)", min: 1, max: 60 },
  { key: "longBreakMinutes", label: "Long break (minutes)", min: 1, max: 120 },
  { key: "sessionsBeforeLongBreak", label: "Focus sessions before a long break", min: 1, max: 12 },
];

interface TimerSettingsProps {
  config: TimerConfig;
  onChange: (next: TimerConfig) => void;
  children: ReactNode;
}

function TimerSettings({ config, onChange, children }: TimerSettingsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Timer settings</DialogTitle>
          <DialogDescription>Changes apply from the next phase you start.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {FIELDS.map(({ key, label, min, max }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <Label htmlFor={`timer-${key}`} className="font-normal">
                {label}
              </Label>
              <Input
                id={`timer-${key}`}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                value={config[key]}
                onChange={(event) => {
                  const value = Math.round(Number(event.target.value));
                  if (Number.isFinite(value) && value >= min && value <= max) {
                    onChange({ ...config, [key]: value });
                  }
                }}
                className="w-20 text-right tabular-nums"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TimerSettings;
