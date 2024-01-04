import { Grid, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import StyledTextField from "../../components/StyledTextField";
import LanguageSelect from "../../components/LanguageSelect";
import { translateTo } from "./translatorUitls";
import { supportedLanguages } from "../../utils/lang";
import LanguageTextField from "../../components/LanguageTextField";

export interface TranslatorTextFieldProps {
  fromLang?: string;
  text?: string;
  lang: string;
  input?: boolean;
  availableLangs?: string[];
  placeholder?: string;

  onLangChange?: (value: string) => void;
  onTextChange?: (value: string) => void;
  onRemoveLang?: (value: string) => void;
}

const StyledRemoveButton = styled.div`
  color: rgba(255, 255, 255, 0.23);
  width: 100%;
  height: 100%;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1.5rem;
  user-select: none;
`;

function TranslatorTextField(props: TranslatorTextFieldProps) {
  // Local state
  const [text, setText] = useState("");

  useEffect(() => {
    if (props.input) {
      // Behaviors for input
    } else {
      // Behaviors for output
      if (props.text && props.fromLang && props.text !== "") {
        translateTo(props.text, props.fromLang, props.lang).then((res) => {
          setText(res);
        });
      } else {
        setText("");
      }
    }
  }, [props.text, props.fromLang, props.lang]);

  return (
    <Grid container columnSpacing={1}>
      <Grid item xs={11.5}>
        <LanguageTextField
          text={text}
          availableLangs={
            props.input ? supportedLanguages : props.availableLangs ?? []
          }
          lang={props.lang}
          placeholder={props.placeholder ?? "..."}
          readonlyTextField={!props.input}
          onLangChange={(event) => {
            props.onLangChange?.(event);
          }}
          onTextChange={(value) => {
            setText(value);
            props.onTextChange?.(value);
          }}
        />
      </Grid>
      {!props.input && (
        <Grid item xs={0.5}>
          <StyledRemoveButton onClick={() => props.onRemoveLang?.(props.lang)}>
            ×
          </StyledRemoveButton>
        </Grid>
      )}
    </Grid>
  );
}

export default TranslatorTextField;
