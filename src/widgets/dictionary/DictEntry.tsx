import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import LanguageSelect from "../../components/LanguageSelect";
import { StyledTextField } from "../../components/StyledComponents";
import SpeechPlayer from "../text-to-speech/SpeechPlayer";
import { useDebounce } from "../../hooks/useDebounce";
import { translateTo } from "../translator/translatorUitls";
import RemoveButton from "../../components/RemoveButton";

export interface DictEntryProps {
  index: number;

  from: string;
  to: string;
  text: string;

  availableLangs?: string[];
  fixedLang?: boolean;

  onFromChange?: (value: string, index: number) => void;
  onToChange?: (value: string, index: number) => void;
  onTextChange?: (value: string, index: number) => void;

  onRemove?: (index: number) => void;
}

function DictEntry(props: DictEntryProps) {
  const [from, setFrom] = useState(props.from);
  const [to, setTo] = useState(props.to);
  const [text, setText] = useState(props.text);

  const textToTranslate = useDebounce(text, 1000);
  const [translatedText, setTranslatedText] = useState("");

  const handleFromChange = (value: string) => {
    setFrom(value);
    props.onFromChange?.(value, props.index);
  };

  const handleToChange = (value: string) => {
    setTo(value);
    props.onToChange?.(value, props.index);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    props.onTextChange?.(value, props.index);
  };

  function handleRemoveButtonClick(): void {
    props.onRemove?.(props.index);
  }

  // Translation
  useEffect(() => {
    if (textToTranslate && from && to) {
      translateTo(textToTranslate, from, to).then((res) => {
        setTranslatedText(res);
      });
    } else {
      setTranslatedText("");
    }
  }, [textToTranslate, from, to]);

  return (
    <Grid container spacing={2}>
      {!props.fixedLang && (
        <>
          <Grid item xs={1.5}>
            <LanguageSelect
              lang={from}
              availableLangs={props.availableLangs}
              onChange={handleFromChange}
            />
          </Grid>
          <Grid item xs={1.5}>
            <LanguageSelect
              lang={to}
              availableLangs={props.availableLangs}
              onChange={handleToChange}
            />
          </Grid>
        </>
      )}
      <Grid item xs={3.5}>
        <StyledTextField
          fullWidth
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
        />
      </Grid>
      <Grid item xs={0.5}>
        <SpeechPlayer lang={props.from} text={props.text} />
      </Grid>
      <Grid item xs={3.5}>
        <StyledTextField disabled fullWidth value={translatedText} />
      </Grid>
      <Grid item xs={0.5}>
        <SpeechPlayer lang={props.to} text={translatedText} />
      </Grid>
      <Grid item xs={0.5}>
        <RemoveButton onClick={handleRemoveButtonClick} />
      </Grid>
    </Grid>
  );
}

export default DictEntry;
