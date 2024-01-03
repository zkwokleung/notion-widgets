import { Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import StyledTextField from "../../components/StyledTextField";
import { translateTo } from "./translate";
import LanguageSelect from "./LanguageSelect";

export interface TranslationResultProps {
  fromLanguage: string;
  fromText: string;
  defaultToLanguage?: string;
}

function TranslationResult(props: TranslationResultProps) {
  const [translatedText, setTranslatedText] = useState("");
  const [toLanguage, setToLanguage] = useState(props.defaultToLanguage || "es");

  useEffect(() => {
    if (props.fromText !== "") {
      translateTo(props.fromText, props.fromLanguage, toLanguage).then(
        (res) => {
          setTranslatedText(res);
        }
      );
    } else {
      setTranslatedText("");
    }
  }, [props.fromText, props.fromLanguage, toLanguage]);

  return (
    <Grid container>
      <Grid item xs={1.5}>
        <LanguageSelect onChange={setToLanguage} defaultLanguage={toLanguage} />
      </Grid>
      <Grid item xs={10}>
        <StyledTextField
          id="outlined-multiline-static"
          multiline
          rows={1}
          placeholder="Translated text here"
          aria-readonly={true}
          inputProps={{ readOnly: true }}
          value={translatedText}
        />
      </Grid>
    </Grid>
  );
}

export default TranslationResult;
