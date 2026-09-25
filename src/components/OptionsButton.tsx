import { StyledActionButton } from "./StyledComponents";
import { Settings as SettingsIcon } from "@mui/icons-material";

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
