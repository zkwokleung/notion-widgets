import React from "react";
import TranslateIcon from "@mui/icons-material/Translate";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import WidgetCard from "./WidgetCard";
import AutoLayout from "../../components/AutoLayout";
import { AppBar, Toolbar, Typography } from "@mui/material";
import styled from "styled-components";

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #0a0a0a;

  height: 100vh;
`;

export const widgetsData = [
  {
    title: "Translator",
    link: "/translator",
    avatar: <TranslateIcon />,
  },
  {
    title: "Text-to-Speech",
    link: "/text-to-speech",
    avatar: <VolumeUpIcon />,
  },
];

function Home() {
  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography>Notion Widgets</Typography>
        </Toolbar>
      </AppBar>
      <StyledBody>
        <AutoLayout>
          {widgetsData.map((widget) => {
            return (
              <WidgetCard
                title={widget.title}
                link={widget.link}
                avatar={widget.avatar}
              />
            );
          })}
        </AutoLayout>
      </StyledBody>
    </>
  );
}

export default Home;
