import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTextToSpeechInitContext } from "./TextToSpeechInitContextProvider";
import { Grid } from "@mui/material";
import TTSTextField from "./TTSTextField";
import {
  StyledActionButton,
  StyledActionLayout,
  StyledCard,
} from "../../components/StyledComponents";
import CopyParamalinkButton from "../../components/CopyParamalinkButton";

function TextToSpeech() {
  const { lang: fixedLang } = useParams<{ lang: string }>();
  const { speechTexts: initSpeechTexts } = useTextToSpeechInitContext();
  const [speechTexts, setSpeechTexts] = useState(initSpeechTexts);

  const [, setSearchParams] = useSearchParams();

  const handleLanguageSelected = (value: string, id: number) => {
    const newSpeechTexts = [...speechTexts];
    newSpeechTexts[id].lang = value;
    setSpeechTexts(newSpeechTexts);
  };

  const handleTextChange = (value: string, id: number) => {
    const newSpeechTexts = [...speechTexts];
    newSpeechTexts[id].text = value;
    setSpeechTexts(newSpeechTexts);
    console.log(speechTexts);
  };

  const handleAddSpeech = () => {
    setSpeechTexts([
      ...speechTexts,
      {
        lang: fixedLang ?? "en",
        text: "",
      },
    ]);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    speechTexts.forEach((speechText) => {
      if (!speechText.text) return;

      if (!fixedLang) {
        params.append("lang", speechText.lang);
      }
      params.append("text", speechText.text);
    });

    setSearchParams(params);
  }, [speechTexts, fixedLang, setSearchParams]);

  return (
    <StyledCard variant="outlined">
      <Grid container rowSpacing={1}>
        {speechTexts.map((speechText, idx) => (
          <Grid item xs={12}>
            <TTSTextField
              id={idx}
              lang={fixedLang ?? speechText.lang}
              text={speechText.text}
              fixedLang={!!fixedLang}
              onLanguageSelected={handleLanguageSelected}
              onTextChange={handleTextChange}
            />
          </Grid>
        ))}
      </Grid>
      <StyledActionLayout>
        <StyledActionButton onClick={handleAddSpeech}>+</StyledActionButton>
        <CopyParamalinkButton />
      </StyledActionLayout>
    </StyledCard>
  );
}

export default TextToSpeech;
