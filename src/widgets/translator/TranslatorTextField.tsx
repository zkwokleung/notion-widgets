import { Grid } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
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
  const [inputText, setInputText] = useState("");
  const translatedText = useTranslation(
    props.input ? "" : (props.text ?? ""),
    props.fromLang ?? "",
    props.lang
  );

  return (
    <Grid container columnSpacing={1}>
      <Grid item xs={11.5}>
        <LanguageTextField
          text={props.input ? inputText : translatedText}
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
            setInputText(value);
            props.onTextChange?.(value);
          }}
        />
      </Grid>
      {!props.input && props.onRemoveLang && (
        <Grid item xs={0.5}>
          <RemoveButton onClick={() => props.onRemoveLang?.(props.lang)} />
        </Grid>
      )}
    </Grid>
  );
}

export default TranslatorTextField;
