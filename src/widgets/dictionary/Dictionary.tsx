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
import { Box } from "@mui/material";
import AutoLayout from "../../components/AutoLayout";
import DictOptionMenu from "./DictOptionMenu";

function Dictionary() {
  const { fixedFrom, fixedTo, words: initWords } = useDictionaryInitContext();
  const [words, setWords] = useState(initWords);

  const [, setSearchParams] = useSearchParams();

  // Menus
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);

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

  function handleOptionsButtonClick(): void {
    setOptionsMenuOpen(true);
  }

  function handleOptionMenuClose(): void {
    setOptionsMenuOpen(false);
  }

  // UseEffects
  useEffect(() => {
    const params = new URLSearchParams();
    words.forEach((word) => {
      params.append("from", word.from);
      params.append("to", word.to);
      params.append("text", word.text);
    });
    setSearchParams(params);
  }, [words, setSearchParams]);

  return (
    <>
      <StyledCard>
        {words.map((word, i) => (
          <DictEntry
            index={i}
            from={fixedFrom || word.from}
            to={fixedTo || word.to}
            text={word.text}
            fixedLang={!!fixedFrom && !!fixedTo}
            onFromChange={handleFromChange}
            onToChange={handleToChange}
            onTextChange={handleTextChange}
            onRemove={handleRemoveButtonClick}
          />
        ))}
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

      <DictOptionMenu open={optionsMenuOpen} onClose={handleOptionMenuClose} />
    </>
  );
}

export default Dictionary;
