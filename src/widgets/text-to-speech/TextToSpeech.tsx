import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTextToSpeechInitContext } from "./TextToSpeechInitContextProvider";
import { Grid } from "@mui/material";
import TTSTextField from "./TTSTextField";
import { StyledCard } from "../../components/StyledComponents";

function TextToSpeech() {
  const { lang: fixedLang } = useParams<{ lang: string }>();
  const { speechTexts: initSpeechTexts } = useTextToSpeechInitContext();
  const [speechTexts, setSpeechTexts] = useState(initSpeechTexts);

  const handleLanguageSelected = (value: string) => {};

  const handleTextChange = (value: string) => {};

  return (
    <StyledCard variant="outlined">
      <Grid container>
        {speechTexts.map((speechText, idx) => (
          <Grid item xs={12}>
            <TTSTextField
              id={idx}
              lang={fixedLang || speechText.lang}
              text={speechText.text}
              fixedLang={!!fixedLang}
              onLanguageSelected={handleLanguageSelected}
              onTextChange={handleTextChange}
            />
          </Grid>
        ))}
      </Grid>
    </StyledCard>
  );
}

export default TextToSpeech;
