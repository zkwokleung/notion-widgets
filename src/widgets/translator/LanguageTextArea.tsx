import { Grid, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import StyledTextField from "../../components/StyledTextField";
import LanguageSelect from "./LanguageSelect";
import { supportedLanguages, translateTo } from "./translate";

export interface LanguageTextAreaProps {
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

function LanguageTextArea(props: LanguageTextAreaProps) {
  // Responsive UI
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1190));

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
      <Grid item xs={isSmallScreen ? 2 : 1.5}>
        <LanguageSelect
          availableLangs={
            props.input ? supportedLanguages : props.availableLangs ?? []
          }
          lang={props.lang}
          onChange={(event) => {
            if (props.onLangChange) {
              props.onLangChange?.(event);
            }
          }}
        />
      </Grid>
      <Grid item xs={isSmallScreen ? 9.5 : 10}>
        <StyledTextField
          id="outlined-multiline-static"
          multiline
          rows={1}
          placeholder={props.placeholder ?? "..."}
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

export default LanguageTextArea;
