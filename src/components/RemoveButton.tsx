import { Typography } from "@mui/material";
import React from "react";
import styled from "styled-components";
import CloseIcon from "@mui/icons-material/Close";

const StyledRemoveButton = styled.div`
  color: rgba(255, 255, 255, 0.23);
  width: 100%;
  height: 100%;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1.5rem;
  user-select: none;
`;

interface RemoveButtonProps {
  onClick?: () => void;
}

function RemoveButton(props: RemoveButtonProps) {
  return (
    <StyledRemoveButton onClick={props.onClick}>
      <CloseIcon />
    </StyledRemoveButton>
  );
}

export default RemoveButton;
