import React from "react";
import WidgetCard from "./WidgetCard";
import AutoLayout from "../../components/AutoLayout";
import { AppBar, Toolbar, Typography } from "@mui/material";
import styled from "styled-components";

import TranslateIcon from "@mui/icons-material/Translate";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import BookIcon from "@mui/icons-material/Book";

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
  {
    title: "Dictionary",
    link: "/dictionary",
    avatar: <BookIcon />,
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
