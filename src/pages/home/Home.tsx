import WidgetCard from "./WidgetCard";
import AutoLayout from "../../components/AutoLayout";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import styled from "styled-components";

import { widgetDefinitions } from "../../widgets/registry";

const StyledBody = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #0a0a0a;

  height: 100vh;
  width: 100vw;
`;

function Home() {
  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography>Notion Widgets</Typography>
        </Toolbar>
      </AppBar>
      <StyledBody>
        <Box
          sx={{
            margin: "10px",
          }}
        >
          <AutoLayout>
            {widgetDefinitions.map(({ type, title, Icon }) => (
              <WidgetCard key={type} title={title} link={`/${type}`} avatar={<Icon />} />
            ))}
          </AutoLayout>
        </Box>
      </StyledBody>
    </>
  );
}

export default Home;
