import React, { useState } from "react";
import { StyledActionButton } from "./StyledComponents";
import DoneIcon from "@mui/icons-material/Done";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Typography } from "@mui/material";

function CopyParamalinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopyParmalink = () => {
    navigator.clipboard.writeText(document.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <StyledActionButton onClick={handleCopyParmalink}>
      {copied ? (
        <DoneIcon fontSize="small" color="success" />
      ) : (
        <>
          <ContentCopyIcon /> <Typography>Copy Parmalink</Typography>
        </>
      )}
    </StyledActionButton>
  );
}

export default CopyParamalinkButton;
