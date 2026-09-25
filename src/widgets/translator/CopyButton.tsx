import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ActionButton from "./ActionButton";

interface CopyButtonProps {
  text: string;
  label: string;
}

function CopyButton({ text, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = () => {
    // Wrapped so a missing Clipboard API (insecure context) rejects instead of throwing.
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(text))
      .then(
        () => {
          setCopied(true);
          window.clearTimeout(resetTimer.current);
          resetTimer.current = window.setTimeout(() => setCopied(false), 1500);
        },
        () => toast.error("Couldn't copy to the clipboard")
      );
  };

  return (
    <ActionButton
      label={label}
      tooltip={copied ? "Copied" : "Copy"}
      onClick={copy}
      disabled={!text}
    >
      {copied ? <Check /> : <Copy />}
    </ActionButton>
  );
}

export default CopyButton;
