import { Card, Divider, Grid } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import TranslatorTextField from "./TranslatorTextField";
import { useTranslatorInitContext } from "./TranslatorInitContextProvider";

import DoneIcon from "@mui/icons-material/Done";
import { supportedLanguages } from "../../utils/lang";

const StyledCard = styled(Card)`
  color: white;
  padding: 1rem;
  margin: 0rem;
`;

const StyledGrid = styled(Grid)`
  margin: 1rem;
`;

const StyledActionButton = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.23);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.23);
  padding: 0.2rem 0.5rem;
  display: flex;
  justify-content: center;
  font-size: 1rem;
  margin-top: 0.5rem;
  user-select: none;
  cursor: pointer;

  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 0.5);
  }
`;

const StyledActionLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default function Translator() {
  // Translator
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState("");
  const [textToTranslate, setTextToTranslate] = useState("");

  // Load the initial languages from the URL search params
  const { from, to } = useTranslatorInitContext();

  const [fromLanguage, setFromLanguage] = useState(from);
  const [toLanguages, setToLanguages] = useState(to);

  const [, setSearchParams] = useSearchParams();

  const [copied, setCopied] = useState(false);

  const availableToLanguages = useMemo(() => {
    return supportedLanguages.filter(
      (lang) => lang !== fromLanguage && !toLanguages.includes(lang)
    );
  }, [fromLanguage, toLanguages]);

  const onTextChange = (value: string) => {
    // Delay the translation by 1 second, if the user is still typing, cancel the previous translation
    setIsTyping(true);
    setText(value);
  };

  const onLanguageSelected = (value: string) => {
    setFromLanguage(value);
  };

  const handleToLangChange = (lang: string, newLang: string) => {
    console.log(lang, newLang);
    const newToLanguages = [...toLanguages];
    const index = newToLanguages.indexOf(lang);
    if (index > -1) {
      newToLanguages.splice(index, 1, newLang);
    }

    setToLanguages(newToLanguages);
  };

  const handleAddToLang = () => {
    const newToLanguages = [...toLanguages];

    // Find the unselected to language
    const unselectedLang = supportedLanguages.find(
      (lang) => !toLanguages.includes(lang) && lang !== fromLanguage
    );

    if (!unselectedLang) {
      alert("No more supported languages to add!");
      return;
    }

    newToLanguages.push(unselectedLang);
    setToLanguages(newToLanguages);
  };

  const handleRemoveToLang = (lang: string) => {
    const newToLanguages = [...toLanguages];
    const index = newToLanguages.indexOf(lang);
    if (index > -1) {
      newToLanguages.splice(index, 1);
    }

    setToLanguages(newToLanguages);
  };

  const handleCopyParmalink = () => {
    navigator.clipboard.writeText(document.location.href);
    setCopied(true);
  };

  useEffect(() => {
    console.log(fromLanguage, toLanguages);
    const params = new URLSearchParams();
    params.set("from", fromLanguage);
    toLanguages.forEach((lang) => params.append("to", lang));

    setSearchParams(params);
  }, [fromLanguage, toLanguages, setSearchParams]);

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

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return (
    <StyledCard variant="outlined">
      <Grid container rowSpacing={1}>
        <StyledGrid item xs={12}>
          <TranslatorTextField
            input
            lang={fromLanguage}
            onLangChange={onLanguageSelected}
            onTextChange={onTextChange}
            placeholder="Type something to translate..."
          />
        </StyledGrid>

        <StyledGrid item xs={12}>
          <Divider textAlign="left" variant="middle" flexItem>
            Translations
          </Divider>
        </StyledGrid>

        {toLanguages.map((lang) => (
          <StyledGrid item xs={12}>
            <TranslatorTextField
              fromLang={fromLanguage}
              text={textToTranslate}
              lang={lang}
              onLangChange={(newLang) => handleToLangChange(lang, newLang)}
              onRemoveLang={handleRemoveToLang}
              availableLangs={[...availableToLanguages, lang]}
            />
          </StyledGrid>
        ))}
      </Grid>
      <StyledActionLayout>
        <StyledActionButton onClick={handleAddToLang}>+</StyledActionButton>
        <StyledActionButton onClick={handleCopyParmalink}>
          {copied ? (
            <DoneIcon fontSize="small" color="success" />
          ) : (
            "Copy Parmalink"
          )}
        </StyledActionButton>
      </StyledActionLayout>
    </StyledCard>
  );
}
