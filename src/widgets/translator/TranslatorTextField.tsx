import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { translateTo } from "./translatorUitls";
import { supportedLanguages } from "../../utils/lang";
import LanguageTextField from "../../components/LanguageTextField";
import RemoveButton from "../../components/RemoveButton";

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

function TranslatorTextField(props: TranslatorTextFieldProps) {
  // Local state
  const [text, setText] = useState("");

  useEffect(() => {
    if (props.input) return;

    if (!props.text || !props.fromLang) {
      setText("");
      return;
    }

    const controller = new AbortController();
    translateTo(props.text, props.fromLang, props.lang, controller.signal)
      .then(setText)
      .catch((error) => {
        if (error.name !== "AbortError") throw error;
      });
    return () => controller.abort();
  }, [props.text, props.fromLang, props.lang, props.input]);

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
          <RemoveButton onClick={() => props.onRemoveLang?.(props.lang)} />
        </Grid>
      )}
    </Grid>
  );
}

export default TranslatorTextField;
