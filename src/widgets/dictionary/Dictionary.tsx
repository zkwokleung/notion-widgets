import React, { useEffect, useState } from "react";
import {
  StyledActionButton,
  StyledActionLayout,
  StyledCard,
} from "../../components/StyledComponents";
import { useDictionaryInitContext } from "./DictionaryInitContextProvider";
import { useSearchParams } from "react-router-dom";
import CopyParamalinkButton from "../../components/CopyParamalinkButton";
import DictEntry from "./DictEntry";
import AddIcon from "@mui/icons-material/Add";
import OptionsButton from "../../components/OptionsButton";
import { Box, Stack } from "@mui/material";
import AutoLayout from "../../components/AutoLayout";
import DictOptionMenu from "./DictOptionMenu";

function Dictionary() {
  const {
    hideOriginTTSBtn: initHideOriginTTSBtn,
    hideTranslatedTTSBtn: initHideTranslatedBrn,
    fixedFrom: initFixedFrom,
    fixedTo: initFixedTo,
    words: initWords,
  } = useDictionaryInitContext();

  const [fixedLang, setFixedLang] = useState(!!initFixedFrom && !!initFixedTo);
  const [fixedFrom, setFixedFrom] = useState(initFixedFrom);
  const [fixedTo, setFixedTo] = useState(initFixedTo);
  const [words, setWords] = useState(initWords);

  const [, setSearchParams] = useSearchParams();

  // Menus
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [hideOriginTTSBtn, setHideOriginTTSBtn] =
    useState(initHideOriginTTSBtn);
  const [hideTranslatedTTSBtn, setHideTranslatedTTSbtn] = useState(
    initHideTranslatedBrn
  );

  // Event Handlers
  function handleFromChange(value: string, id: number): void {
    const newWords = [...words];
    newWords[id].from = value;
    setWords(newWords);
  }

  function handleToChange(value: string, id: number): void {
    const newWords = [...words];
    newWords[id].to = value;
    setWords(newWords);
  }

  function handleTextChange(value: string, id: number): void {
    const newWords = [...words];
    newWords[id].text = value;
    setWords(newWords);
  }

  function handleRemoveButtonClick(id: number): void {
    const newWords = [...words];
    newWords.splice(id, 1);
    setWords(newWords);
  }

  function handleAddButtonClick(): void {
    setWords([...words, { from: "fr", to: "en", text: "" }]);
  }

  // * Options Menu
  function handleOptionsButtonClick(): void {
    setOptionsMenuOpen(true);
  }

  function handleOptionMenuClose(): void {
    setOptionsMenuOpen(false);
  }

  function handleOptionMenuOriginTTSBtnDisplayChange(value: boolean): void {
    setHideOriginTTSBtn(value);
  }

  function handleOptionMenuTranslatedTTSBtnDisplayChange(value: boolean): void {
    setHideTranslatedTTSbtn(value);
  }

  function handleOptionMenuFixedLangChange(value: boolean): void {
    setFixedLang(value);
    console.log(value);
    if (value) {
      if (!fixedFrom) {
        setFixedFrom("fr");
      }
      if (!fixedTo) {
        setFixedTo("en");
      }
    } else {
      setWords(
        words.map((word) => {
          return { ...word, from: "fr", to: "en" };
        })
      );
    }
  }

  function handleOptionMenuFromChange(value: string): void {
    setFixedFrom(value);
  }

  function handleOptionMenuToChange(value: string): void {
    setFixedTo(value);
  }

  // * UseEffects
  // Search Params
  useEffect(() => {
    const params = new URLSearchParams();

    if (fixedLang) {
      params.append("fixedFrom", fixedFrom || "");
      params.append("fixedTo", fixedTo || "");
    }

    if (hideOriginTTSBtn) {
      params.append("hotb", "true");
    }

    if (hideTranslatedTTSBtn) {
      params.append("httb", "true");
    }

    words.forEach((word) => {
      if (!fixedLang) {
        params.append("from", word.from);
        params.append("to", word.to);
      }
      params.append("text", word.text);
    });
    setSearchParams(params);
  }, [
    words,
    setSearchParams,
    fixedLang,
    fixedFrom,
    fixedTo,
    hideOriginTTSBtn,
    hideTranslatedTTSBtn,
  ]);

  return (
    <>
      <StyledCard>
        <Stack direction="column" spacing={2}>
          {words.map((word, i) => (
            <DictEntry
              index={i}
              hideOriginTTSButton={hideOriginTTSBtn}
              hideTranslatedTTSButton={hideTranslatedTTSBtn}
              from={fixedLang && fixedFrom ? fixedFrom : word.from}
              to={fixedLang && fixedTo ? fixedTo : word.to}
              text={word.text}
              fixedLang={fixedLang}
              onFromChange={handleFromChange}
              onToChange={handleToChange}
              onTextChange={handleTextChange}
              onRemove={handleRemoveButtonClick}
            />
          ))}
        </Stack>
        <StyledActionLayout>
          <StyledActionButton onClick={handleAddButtonClick}>
            <AddIcon />
          </StyledActionButton>
          <Box sx={{ marginLeft: "auto" }}>
            <AutoLayout>
              <OptionsButton onClick={handleOptionsButtonClick} />
              <CopyParamalinkButton />
            </AutoLayout>
          </Box>
        </StyledActionLayout>
      </StyledCard>

      <DictOptionMenu
        open={optionsMenuOpen}
        onClose={handleOptionMenuClose}
        fixedLang={fixedLang}
        showOriginTTSBtn={hideOriginTTSBtn}
        showTranslatedTTSBtn={hideTranslatedTTSBtn}
        from={fixedFrom}
        to={fixedTo}
        onTTSOriginChange={handleOptionMenuOriginTTSBtnDisplayChange}
        onTTSAfterChange={handleOptionMenuTranslatedTTSBtnDisplayChange}
        onFixedLangChange={handleOptionMenuFixedLangChange}
        onFromChange={handleOptionMenuFromChange}
        onToChange={handleOptionMenuToChange}
      />
    </>
  );
}

export default Dictionary;
