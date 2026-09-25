import { useEffect, useState } from "react";
import {
  StyledActionButton,
  StyledActionLayout,
  StyledCard,
} from "../../components/StyledComponents";
import {
  type DictWord,
  useDictionaryInitContext,
} from "./DictionaryInitContextProvider";
import { useSearchParams } from "react-router-dom";
import CopyParamalinkButton from "../../components/CopyParamalinkButton";
import DictEntry from "./DictEntry";
import { Add as AddIcon } from "@mui/icons-material";
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
  function updateWord(index: number, patch: Partial<DictWord>): void {
    setWords((prev) =>
      prev.map((word, i) => (i === index ? { ...word, ...patch } : word))
    );
  }

  function handleFromChange(value: string, index: number): void {
    updateWord(index, { from: value });
  }

  function handleToChange(value: string, index: number): void {
    updateWord(index, { to: value });
  }

  function handleTextChange(value: string, index: number): void {
    updateWord(index, { text: value });
  }

  function handleRemoveButtonClick(index: number): void {
    setWords((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddButtonClick(): void {
    setWords((prev) => [
      ...prev,
      { id: crypto.randomUUID(), from: "fr", to: "en", text: "" },
    ]);
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
              key={word.id}
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
        hideOriginTTSBtn={hideOriginTTSBtn}
        hideTranslatedTTSBtn={hideTranslatedTTSBtn}
        from={fixedFrom}
        to={fixedTo}
        onHideOriginTTSBtnChange={handleOptionMenuOriginTTSBtnDisplayChange}
        onHideTranslatedTTSBtnChange={
          handleOptionMenuTranslatedTTSBtnDisplayChange
        }
        onFixedLangChange={handleOptionMenuFixedLangChange}
        onFromChange={handleOptionMenuFromChange}
        onToChange={handleOptionMenuToChange}
      />
    </>
  );
}

export default Dictionary;
