import React, { useState } from "react";
import { StyledActionButton } from "./StyledComponents";
import DoneIcon from "@mui/icons-material/Done";

function CopyParamalinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopyParmalink = () => {
    navigator.clipboard.writeText(document.location.href);
    setCopied(true);
  };
  return (
    <StyledActionButton onClick={handleCopyParmalink}>
      {copied ? (
        <DoneIcon fontSize="small" color="success" />
      ) : (
        "Copy Parmalink"
      )}
    </StyledActionButton>
  );
}

export default CopyParamalinkButton;
