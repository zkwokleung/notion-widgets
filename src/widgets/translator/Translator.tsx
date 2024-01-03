import { Card, Divider, Grid, useMediaQuery, useTheme } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { supportedLanguages } from "./translate";
import styled from "styled-components";
import StyledTextField from "../../components/StyledTextField";
import LanguageTextArea from "./LanguageTextArea";
import LanguageSelect from "./LanguageSelect";

const StyledCard = styled(Card)`
  color: white;
  padding: 1rem;
  margin: 0rem;
`;

const StyledGrid = styled(Grid)`
  margin: 1rem;
`;

export default function Translator() {
  // Translator
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState("");
  const [textToTranslate, setTextToTranslate] = useState("");
  const [fromLanguage, setFromLanguage] = useState("en" as string);

  const onTextChange = (value: string) => {
    // Delay the translation by 1 second, if the user is still typing, cancel the previous translation
    setIsTyping(true);
    setText(value);
  };

  const onLanguageSelected = (value: string) => {
    setFromLanguage(value);
  };

  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => {
        if (text !== "") {
          setTextToTranslate(text);
        } else {
          setTextToTranslate("");
        }
        setIsTyping(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isTyping, text]);

  return (
    <StyledCard variant="outlined">
      <Grid container rowSpacing={1}>
        <StyledGrid item xs={12}>
          <LanguageTextArea
            input
            onLangChange={onLanguageSelected}
            onTextChange={onTextChange}
          />
        </StyledGrid>

        <StyledGrid item xs={12}>
          <Divider textAlign="left" variant="middle" flexItem>
            Translations
          </Divider>
        </StyledGrid>

        {supportedLanguages
          .filter((lang) => lang !== fromLanguage && lang !== "zh-TW")
          .map((lang) => (
            <StyledGrid item xs={12}>
              <LanguageTextArea
                fromLang={fromLanguage}
                text={textToTranslate}
                defaultLang={lang}
              />
            </StyledGrid>
          ))}
      </Grid>
    </StyledCard>
  );
}
