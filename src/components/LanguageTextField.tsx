import { Grid, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { supportedLanguages } from "../utils/lang";
import LanguageSelect from "./LanguageSelect";
import { StyledTextField } from "./StyledComponents";

export interface LanguageTextFieldProps {
  text?: string;
  lang?: string;
  placeholder?: string;
  availableLangs?: string[];
  readonlyTextField?: boolean;

  onLangChange?: (value: string) => void;
  onTextChange?: (value: string) => void;
}

function LanguageTextField(props: LanguageTextFieldProps) {
  // Responsive UI
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1190));

  // Local state
  const [text, setText] = useState(props.text ?? "");

  useEffect(() => {
    setText(props.text ?? "");
  }, [props.text]);

  return (
    <Grid container columnSpacing={1}>
      <Grid item xs={isSmallScreen ? 2 : 1.5}>
        <LanguageSelect
          availableLangs={props.availableLangs || supportedLanguages}
          lang={props.lang || "en"}
          onChange={(event) => {
            props.onLangChange?.(event);
          }}
        />
      </Grid>
      <Grid item xs={isSmallScreen ? 10 : 10.5}>
        <StyledTextField
          id="outlined-multiline-static"
          multiline
          rows={1}
          placeholder={props.placeholder ?? "..."}
          aria-readonly={true}
          inputProps={{ readOnly: props.readonlyTextField }}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            props.onTextChange?.(event.target.value);
          }}
        />
      </Grid>
    </Grid>
  );
}

export default LanguageTextField;
