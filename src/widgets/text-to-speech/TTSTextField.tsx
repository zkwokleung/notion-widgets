import React from "react";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import LanguageTextField from "../../components/LanguageTextField";
import SpeechPlayer from "./SpeechPlayer";
import { StyledTextField } from "../../components/StyledComponents";

export interface TTSTextFieldProps {
  id: number;
  lang: string;
  text: string;
  fixedLang?: boolean;
  placeholder?: string;
  availableLangs?: string[];

  onLanguageSelected?: (value: string, id: number) => void;
  onTextChange?: (value: string, id: number) => void;
}

function TTSTextField(props: TTSTextFieldProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1190));

  const handleLangChange = (value: string) => {
    props.onLanguageSelected?.(value, props.id);
  };

  const handleTextChange = (value: string) => {
    props.onTextChange?.(value, props.id);
  };

  return (
    <Grid container columnSpacing={1}>
      <Grid item xs={isSmallScreen ? 11 : 11.5}>
        {props.fixedLang ? (
          <StyledTextField
            value={props.text}
            color="primary"
            fullWidth
            multiline
            rows={1}
            placeholder={props.placeholder ?? "..."}
            onChange={(event) => handleTextChange(event.target.value)}
          />
        ) : (
          <LanguageTextField
            lang={props.lang}
            text={props.text}
            placeholder={props.placeholder ?? "..."}
            availableLangs={props.availableLangs}
            onLangChange={handleLangChange}
            onTextChange={handleTextChange}
          />
        )}
      </Grid>
      <Grid item xs={isSmallScreen ? 1 : 0.5}>
        <SpeechPlayer lang={props.lang} text={props.text} />
      </Grid>
    </Grid>
  );
}

export default TTSTextField;
