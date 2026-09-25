import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CopyLinkButtonProps {
  label: string;
  url: string;
  variant?: "outline" | "ghost" | "default";
}

function CopyLinkButton({ label, url, variant = "ghost" }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => toast.error("Couldn't copy the link. Copy it from the address bar instead.")
    );
  };

  return (
    <Button type="button" size="sm" variant={variant} onClick={handleCopy}>
      {copied ? <Check className="text-success" /> : <Link2 />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export default CopyLinkButton;
