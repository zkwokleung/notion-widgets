import React from "react";
import { StyledActionButton } from "./StyledComponents";
import SettingsIcon from "@mui/icons-material/Settings";

export interface OptionsButtonProps {
  onClick?: () => void;
}

function OptionsButton(props: OptionsButtonProps) {
  return (
    <StyledActionButton onClick={props.onClick}>
      <SettingsIcon />
    </StyledActionButton>
  );
}

export default OptionsButton;
