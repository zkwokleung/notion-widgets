import { Grid } from "@mui/material";
import React from "react";
import styled from "styled-components";

const StyledGrid = styled(Grid)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
`;

export interface AutoLayoutProps {
  direction?: "row" | "column";
  children?: React.ReactNode;
  sx?: any;
}

function AutoLayout(props: AutoLayoutProps) {
  return (
    <>
      <StyledGrid
        container
        rowSpacing={3}
        columnSpacing={2}
        direction={props.direction ?? "row"}
        sx={props.sx}
      >
        {React.Children.map(props.children, (child) => {
          return <Grid item>{child}</Grid>;
        })}
      </StyledGrid>
    </>
  );
}

export default AutoLayout;
