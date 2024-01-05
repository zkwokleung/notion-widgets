import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "@mui/material";
import { getTextToSpeechURL } from "./textToSpeechUtils";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import PendingIcon from "@mui/icons-material/Pending";

export interface SpeechPlayerProps {
  lang: string;
  text: string;
}

function SpeechPlayer(props: SpeechPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const onPlaying = () => {
      setLoading(false);
      setPlaying(true);
    };
    const onEnded = () => setPlaying(false);

    audio.addEventListener("playing", onPlaying);
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
      {!playing && !loading && (
        <IconButton
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
              setLoading(true);
            }
          }}
        >
          <PlayCircleIcon color="primary" style={iconStyle} />
        </IconButton>
      )}

      {loading && (
        <IconButton>
          <PendingIcon color="primary" style={iconStyle} />
        </IconButton>
      )}

      {playing && (
        <IconButton
          onClick={() => {
            audioRef.current?.pause();
            setPlaying(false);
          }}
        >
          <StopCircleIcon color="primary" style={iconStyle} />
        </IconButton>
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
