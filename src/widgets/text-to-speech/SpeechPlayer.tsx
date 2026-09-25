import { Box, IconButton, Stack } from "@mui/material";
import {
  PlayCircle as PlayCircleIcon,
  StopCircle as StopCircleIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import styled from "styled-components";
import { useSpeech } from "../../hooks/useSpeech";

const StyledIconButton = styled(IconButton)`
  width: 100%;
  height: 100%;
  align-self: center;
`;

export interface SpeechPlayerProps {
  lang: string;
  text: string;
  rate?: number;
}

function SpeechPlayer(props: SpeechPlayerProps) {
  const { status, speak, stop } = useSpeech();

  const iconStyle = {
    height: "100%",
  };

  return (
    <Box>
      <Stack direction="column" spacing={1}>
        <Box flex={1}></Box>
        <Stack direction="row">
          <Box flex={1}></Box>
          {status === "idle" && (
            <StyledIconButton
              aria-label="Play"
              disabled={!props.text}
              onClick={() => void speak(props.text, props.lang, props.rate)}
            >
              <PlayCircleIcon style={iconStyle} />
            </StyledIconButton>
          )}

          {status === "loading" && (
            <StyledIconButton aria-label="Loading" onClick={stop}>
              <PendingIcon style={iconStyle} />
            </StyledIconButton>
          )}

          {status === "playing" && (
            <StyledIconButton aria-label="Stop" onClick={stop}>
              <StopCircleIcon style={iconStyle} />
            </StyledIconButton>
          )}
          <Box flex={1}></Box>
        </Stack>
        <Box flex={1}></Box>
      </Stack>
    </Box>
  );
}

export default SpeechPlayer;
