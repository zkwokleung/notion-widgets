import { Card, Divider, Grid } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import TranslatorTextField from "./TranslatorTextField";
import { useTranslatorInitContext } from "./TranslatorInitContextProvider";

import DoneIcon from "@mui/icons-material/Done";
import { supportedLanguages } from "../../utils/lang";
import { useDebounce } from "../../utils/hooks";
import {
  StyledActionLayout,
  StyledActionButton,
} from "../../components/StyledComponents";
import CopyParamalinkButton from "../../components/CopyParamalinkButton";

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
  const [text, setText] = useState("");
  const textToTranslate = useDebounce(text, 500);

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

  const handleTextChange = (value: string) => {
    setText(value);
  };

  const handleLanguageSelected = (value: string) => {
    setFromLanguage(value);
  };

  const handleToLangChange = (lang: string, newLang: string) => {
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
    const params = new URLSearchParams();
    params.set("from", fromLanguage);
    toLanguages.forEach((lang) => params.append("to", lang));

    setSearchParams(params);
  }, [fromLanguage, toLanguages, setSearchParams]);

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
            onLangChange={handleLanguageSelected}
            onTextChange={handleTextChange}
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
        <CopyParamalinkButton />
      </StyledActionLayout>
    </StyledCard>
  );
}
