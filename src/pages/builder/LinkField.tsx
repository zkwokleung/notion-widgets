import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CopyLinkButton from "@/components/widget/CopyLinkButton";

interface LinkFieldProps {
  label: string;
  hint: string;
  url: string;
}

function LinkField({ label, hint, url }: LinkFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-1">
        <Input
          id={id}
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
          className="font-mono text-xs md:text-xs"
        />
        <CopyLinkButton label="Copy" url={url} variant="outline" />
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export default LinkField;
