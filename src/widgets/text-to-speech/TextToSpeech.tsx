import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { IconButton } from "@mui/material";
import { getTextToSpeechURL } from "./textToSpeechUtils";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import styled from "styled-components";

const StyledIconButton = styled(IconButton)`
  min-width: 100%;
`;

function TextToSpeech() {
  const params = useParams<{ lang: string; text: string }>();
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
            audioRef.current?.play();
            setPlaying(true);
          }}
        >
          <PlayCircleIcon color="primary" style={iconStyle} />
        </StyledIconButton>
      ) : (
        <StyledIconButton
          onClick={() => {
            audioRef.current?.play();
            setPlaying(true);
          }}
        >
          <StopCircleIcon color="primary" style={iconStyle} />
        </StyledIconButton>
      )}

      {params.lang && params.text && (
        <audio
          src={getTextToSpeechURL(params.lang, params.text)}
          ref={audioRef}
        />
      )}
    </>
  );
}

export default TextToSpeech;
