import { Done as DoneIcon, Link as LinkIcon } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useState } from "react";

interface CopyLinkButtonProps {
  label: string;
  url: string;
}

function CopyLinkButton({ label, url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false)
    );
  };

  return (
    <Button
      size="small"
      variant="outlined"
      color="inherit"
      startIcon={copied ? <DoneIcon color="success" /> : <LinkIcon />}
      onClick={handleCopy}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}

export default CopyLinkButton;
