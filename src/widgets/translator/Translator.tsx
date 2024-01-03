import { Card, TextField } from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { translateTo } from "./translate";
import styled from "styled-components";

const StyledCard = styled(Card)`
  color: white;
  padding: 1rem;
  margin: 0rem;
`;

const StyledTextField = styled(TextField)`
  width: 100%;
  margin: 0.5rem;
  color: white;
`;

export default function Translator() {
  const [isTyping, setIsTyping] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [text, setText] = useState("");

  const onTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Delay the translation by 1 second, if the user is still typing, cancel the previous translation
    setIsTyping(true);
    setText(event.target.value);
  };

  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => {
        if (text !== "") {
          translateTo(text, "en", "es").then((res) => {
            setTranslatedText(res);
          });
        }
        setIsTyping(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isTyping, text]);

  return (
    <StyledCard variant="outlined">
      <StyledTextField
        id="outlined-multiline-static"
        label="Your text"
        multiline
        rows={1}
        placeholder="Your text here"
        color="success"
        onChange={onTextChange}
      />
      <StyledTextField
        id="outlined-multiline-static"
        multiline
        rows={1}
        placeholder="Translated text here"
        aria-readonly={true}
        inputProps={{ readOnly: true }}
        value={translatedText}
      />
    </StyledCard>
  );
}
