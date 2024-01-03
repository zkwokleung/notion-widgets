import { Grid, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import StyledTextField from "../../components/StyledTextField";
import { translateTo } from "./translate";
import LanguageSelect from "./LanguageSelect";

export interface LanguageTextAreaProps {
  fromLang?: string;
  text?: string;
  defaultLang?: string;
  input?: boolean;

  onLangChange?: (value: string) => void;
  onTextChange?: (value: string) => void;
}

function LanguageTextArea(props: LanguageTextAreaProps) {
  // Responsive UI
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1190));

  // Local state
  const [text, setText] = useState("");
  const [lang, setLang] = useState(props.defaultLang || "en");

  useEffect(() => {
    if (props.input) {
      // Behaviors for input
    } else {
      // Behaviors for output
      if (props.text && props.fromLang && props.text !== "") {
        translateTo(props.text, props.fromLang, lang).then((res) => {
          setText(res);
        });
      } else {
        setText("");
      }
    }
  }, [props.text, props.fromLang, lang]);

  return (
    <Grid container columnSpacing={1}>
      <Grid item xs={isSmallScreen ? 2 : 1.5}>
        <LanguageSelect
          defaultLanguage={lang}
          onChange={(event) => {
            setLang(event);
            if (props.onLangChange) {
              props.onLangChange(event);
            }
          }}
        />
      </Grid>
      <Grid item xs={isSmallScreen ? 10 : 10.5}>
        <StyledTextField
          id="outlined-multiline-static"
          multiline
          rows={1}
          placeholder="Translated text here"
          aria-readonly={true}
          inputProps={{ readOnly: !props.input }}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (props.onTextChange) {
              props.onTextChange(event.target.value);
            }
          }}
        />
      </Grid>
    </Grid>
  );
}

export default LanguageTextArea;
