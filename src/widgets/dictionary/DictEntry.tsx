import React, { useEffect, useState } from "react";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
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

  hideOriginTTSButton?: boolean;
  hideTranslatedTTSButton?: boolean;

  availableLangs?: string[];
  fixedLang?: boolean;

  onFromChange?: (value: string, index: number) => void;
  onToChange?: (value: string, index: number) => void;
  onTextChange?: (value: string, index: number) => void;

  onRemove?: (index: number) => void;
}

function DictEntry(props: DictEntryProps) {
  // Data
  const [text, setText] = useState(props.text);
  const textToTranslate = useDebounce(text, 1000);
  const [translatedText, setTranslatedText] = useState("");

  // UI
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1190));
  const [originTextFieldSz, setOriginTextFieldSz] = useState(3.75);
  const [translatedTextFieldSz, setTranslatedTextFieldSz] = useState(3.75);

  // * Handlers
  const handleFromChange = (value: string) => {
    props.onFromChange?.(value, props.index);
  };

  const handleToChange = (value: string) => {
    props.onToChange?.(value, props.index);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    props.onTextChange?.(value, props.index);
  };

  function handleRemoveButtonClick(): void {
    props.onRemove?.(props.index);
  }

  // * UseEffects
  // Translation
  useEffect(() => {
    if (textToTranslate && props.from && props.to) {
      translateTo(textToTranslate, props.from, props.to).then((res) => {
        setTranslatedText(res);
      });
    } else {
      setTranslatedText("");
    }
  }, [textToTranslate, props.from, props.to, props.fixedLang]);

  // TextField Size
  useEffect(() => {
    setOriginTextFieldSz(
      (isSmallScreen ? 3.25 : 3.75) +
        (props.fixedLang ? 1.5 : 0) +
        (props.hideOriginTTSButton ? (isSmallScreen ? 1 : 0.5) : 0)
    );
  }, [isSmallScreen, props.fixedLang, props.hideOriginTTSButton]);

  useEffect(() => {
    setTranslatedTextFieldSz(
      (isSmallScreen ? 3.25 : 3.75) +
        (props.fixedLang ? 1.5 : 0) +
        (props.hideTranslatedTTSButton ? (isSmallScreen ? 1 : 0.5) : 0)
    );
  }, [isSmallScreen, props.fixedLang, props.hideTranslatedTTSButton]);

  return (
    <Grid container spacing={1}>
      {!props.fixedLang && (
        <>
          <Grid item xs={1.5}>
            <LanguageSelect
              lang={props.from}
              availableLangs={props.availableLangs}
              onChange={handleFromChange}
            />
          </Grid>
          <Grid item xs={1.5}>
            <LanguageSelect
              lang={props.to}
              availableLangs={props.availableLangs}
              onChange={handleToChange}
            />
          </Grid>
        </>
      )}

      <Grid item xs={originTextFieldSz}>
        <StyledTextField
          fullWidth
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
        />
      </Grid>
      {!props.hideOriginTTSButton && (
        <Grid item xs={isSmallScreen ? 1 : 0.5}>
          <SpeechPlayer lang={props.from} text={props.text} />
        </Grid>
      )}

      <Grid item xs={translatedTextFieldSz}>
        <StyledTextField disabled fullWidth value={translatedText} />
      </Grid>
      {!props.hideTranslatedTTSButton && (
        <Grid item xs={isSmallScreen ? 1 : 0.5}>
          <SpeechPlayer lang={props.to} text={translatedText} />
        </Grid>
      )}

      <Grid item xs={0.5}>
        <RemoveButton onClick={handleRemoveButtonClick} />
      </Grid>
    </Grid>
  );
}

export default DictEntry;
