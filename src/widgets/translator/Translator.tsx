import {
  Card,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { langCodeToFlag, supportedLanguages, translateTo } from "./translate";
import styled from "styled-components";
import StyledTextField from "../../components/StyledTextField";
import TranslationResult from "./TranslationResult";
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
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState("");
  const [textToTranslate, setTextToTranslate] = useState("");
  const [fromLanguage, setFromLanguage] = useState("en" as string);

  const onTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Delay the translation by 1 second, if the user is still typing, cancel the previous translation
    setIsTyping(true);
    setText(event.target.value);
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
        <StyledGrid item xs={1.5}>
          <LanguageSelect onChange={onLanguageSelected} defaultLanguage="en" />
        </StyledGrid>
        <StyledGrid item xs={10}>
          <StyledTextField
            id="outlined-multiline-static"
            label="Your text"
            multiline
            rows={1}
            placeholder="Your text here"
            color="success"
            onChange={onTextChange}
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
              <TranslationResult
                fromLanguage={fromLanguage}
                fromText={textToTranslate}
                defaultToLanguage={lang}
              />
            </StyledGrid>
          ))}
      </Grid>
    </StyledCard>
  );
}
