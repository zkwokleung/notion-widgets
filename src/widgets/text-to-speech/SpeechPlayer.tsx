import React, { useEffect, useRef, useState } from "react";
import { Box, IconButton, Stack } from "@mui/material";
import { getTextToSpeechURL } from "./textToSpeechUtils";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import PendingIcon from "@mui/icons-material/Pending";
import styled from "styled-components";

const StyledIconButton = styled(IconButton)`
  width: 100%;
  height: 100%;
  align-self: center;
`;

export interface SpeechPlayerProps {
  lang: string;
  text: string;
}

function SpeechPlayer(props: SpeechPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasAudio = !!props.lang && !!props.text;

  // <audio> only mounts once there is text; re-attach when it appears.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => {
      setLoading(false);
      setPlaying(true);
    };
    const onStopped = () => {
      setLoading(false);
      setPlaying(false);
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onStopped);
    audio.addEventListener("error", onStopped);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onStopped);
      audio.removeEventListener("error", onStopped);
    };
  }, [hasAudio]);

  const iconStyle = {
    height: "100%",
  };

  return (
    <Box>
      <Stack direction="column" spacing={1}>
        <Box flex={1}></Box>
        <Stack direction="row">
          <Box flex={1}></Box>
          {!playing && !loading && (
            <StyledIconButton
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setLoading(true);
                  audioRef.current.play().catch(() => setLoading(false));
                }
              }}
            >
              <PlayCircleIcon style={iconStyle} />
            </StyledIconButton>
          )}

          {loading && (
            <StyledIconButton>
              <PendingIcon style={iconStyle} />
            </StyledIconButton>
          )}

          {playing && (
            <StyledIconButton
              onClick={() => {
                audioRef.current?.pause();
                setPlaying(false);
              }}
            >
              <StopCircleIcon style={iconStyle} />
            </StyledIconButton>
          )}

          {hasAudio && (
            <audio
              src={getTextToSpeechURL(props.lang, props.text)}
              ref={audioRef}
            />
          )}
          <Box flex={1}></Box>
        </Stack>
        <Box flex={1}></Box>
      </Stack>
    </Box>
  );
}

export default SpeechPlayer;
