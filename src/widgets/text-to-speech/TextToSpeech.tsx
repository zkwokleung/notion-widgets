import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  type SpeechText,
  useTextToSpeechInitContext,
} from "./TextToSpeechInitContextProvider";
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

  const updateSpeechText = (index: number, patch: Partial<SpeechText>) => {
    setSpeechTexts((prev) =>
      prev.map((speechText, i) =>
        i === index ? { ...speechText, ...patch } : speechText
      )
    );
  };

  const handleLanguageSelected = (value: string, index: number) => {
    updateSpeechText(index, { lang: value });
  };

  const handleTextChange = (value: string, index: number) => {
    updateSpeechText(index, { text: value });
  };

  const handleAddSpeech = () => {
    setSpeechTexts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
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
          <Grid item xs={12} key={speechText.id}>
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
