import { useId, type ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface SettingFieldProps {
  label: string;
  children: (id: string) => ReactNode;
}

function SettingField({ label, children }: SettingFieldProps) {
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

export default SettingField;
