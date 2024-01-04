import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTextToSpeechInitContext } from "./TextToSpeechInitContextProvider";

function TextToSpeech() {
  const { speechTexts } = useTextToSpeechInitContext();

  const { lang } = useParams<{ lang: string }>();

  // TTS states
  const [currentLang, setLang] = useState("en" as string);

  return <></>;
}

export default TextToSpeech;
