import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "@mui/material";
import { getTextToSpeechURL } from "./textToSpeechUtils";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import styled from "styled-components";

const StyledIconButton = styled(IconButton)`
  min-width: 100%;
`;

export interface SpeechPlayerProps {
  lang: string;
  text: string;
}

function SpeechPlayer(props: SpeechPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const onEnded = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("ended", onEnded);
    };
  });

  const iconStyle = {
    width: "100%",
    height: "100%",
  };

  return (
    <>
      {!playing ? (
        <StyledIconButton
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
              setPlaying(true);
            }
          }}
        >
          <PlayCircleIcon color="primary" style={iconStyle} />
        </StyledIconButton>
      ) : (
        <StyledIconButton
          onClick={() => {
            audioRef.current?.pause();
            setPlaying(false);
          }}
        >
          <StopCircleIcon color="primary" style={iconStyle} />
        </StyledIconButton>
      )}

      {props.lang && props.text && (
        <audio
          src={getTextToSpeechURL(props.lang, props.text)}
          ref={audioRef}
        />
      )}
    </>
  );
}

export default SpeechPlayer;
