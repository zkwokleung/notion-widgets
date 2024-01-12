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

export interface DictionaryProps {}

function Dictionary() {
  const { fixedFrom, fixedTo, words: initWords } = useDictionaryInitContext();
  const [words, setWords] = useState(initWords);

  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();
    words.forEach((word) => {
      params.append("from", word.from);
      params.append("to", word.to);
      params.append("text", word.text);
    });
    setSearchParams(params);
  }, [words, setSearchParams]);

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
            +
          </StyledActionButton>
          <CopyParamalinkButton />
        </StyledActionLayout>
      </StyledCard>
    </>
  );
}

export default Dictionary;
