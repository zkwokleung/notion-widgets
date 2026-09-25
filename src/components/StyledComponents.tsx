import { Card, Grid, TextField, styled as muiStyled } from "@mui/material";
import styled from "styled-components";

export const StyledActionButton = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.23);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.23);
  padding: 0.2rem 0.5rem;
  display: flex;
  justify-content: center;
  font-size: 1rem;
  margin-top: 0.5rem;
  user-select: none;
  cursor: pointer;

  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 0.5);
  }
`;

export const StyledCard = styled(Card)`
  color: white;
  padding: 1rem;
  margin: 0rem;
`;

// styled-components >=6.5 drops TextField's prop types (untyped onChange), so use MUI's styled here.
export const StyledTextField = muiStyled(TextField)`
  width: 100%;
  margin: 0.5rem;
`;

export const StyledGrid = styled(Grid)`
  margin: 1rem;
`;

export const StyledActionLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
