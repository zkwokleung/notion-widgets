import { useState } from "react";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import LanguageSelect from "../../components/LanguageSelect";
import { StyledTextField } from "../../components/StyledComponents";
import SpeechPlayer from "../text-to-speech/SpeechPlayer";
import { useDebounce } from "../../hooks/useDebounce";
import { useTranslation } from "../../hooks/useTranslation";
import RemoveButton from "../../components/RemoveButton";

export interface DictEntryProps {
  index: number;

  from: string;
  to: string;
  text: string;
  rate?: number;
  readOnly?: boolean;

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
  const translatedText = useTranslation(textToTranslate, props.from, props.to);

  // UI
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1190));
  const ttsButtonSz = isSmallScreen ? 1 : 0.5;
  const baseTextFieldSz =
    (isSmallScreen ? 3.25 : 3.75) + (props.fixedLang ? 1.5 : 0);
  const originTextFieldSz =
    baseTextFieldSz + (props.hideOriginTTSButton ? ttsButtonSz : 0);
  const translatedTextFieldSz =
    baseTextFieldSz + (props.hideTranslatedTTSButton ? ttsButtonSz : 0);

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
        <Grid item xs={ttsButtonSz}>
          <SpeechPlayer lang={props.from} text={props.text} rate={props.rate} />
        </Grid>
      )}

      <Grid item xs={translatedTextFieldSz}>
        <StyledTextField disabled fullWidth value={translatedText} />
      </Grid>
      {!props.hideTranslatedTTSButton && (
        <Grid item xs={ttsButtonSz}>
          <SpeechPlayer lang={props.to} text={translatedText} rate={props.rate} />
        </Grid>
      )}

      {!props.readOnly && (
        <Grid item xs={0.5}>
          <RemoveButton onClick={handleRemoveButtonClick} />
        </Grid>
      )}
    </Grid>
  );
}

export default DictEntry;
