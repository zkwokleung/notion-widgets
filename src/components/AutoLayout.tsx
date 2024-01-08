import { Grid } from "@mui/material";
import React from "react";
import styled from "styled-components";

const StyledGrid = styled(Grid)`
  padding: 10px;
  margin: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
`;

export interface AutoLayoutProps {
  children?: React.ReactNode;
}

function AutoLayout(props: AutoLayoutProps) {
  return (
    <>
      <StyledGrid container rowSpacing={3} columnSpacing={2}>
        {React.Children.map(props.children, (child) => {
          return <Grid item>{child}</Grid>;
        })}
      </StyledGrid>
    </>
  );
}

export default AutoLayout;
