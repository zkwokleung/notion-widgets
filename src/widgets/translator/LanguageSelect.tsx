import React from "react";
import { Select, MenuItem, SelectChangeEvent } from "@mui/material";
import {
  supportedLanguages,
  langCodeToLanguageName,
  langCodeToFlag,
} from "./translate";

export interface LanguageSelectProps {
  onChange: (value: string) => void;
  defaultLanguage?: string;
}

function LanguageSelect(props: LanguageSelectProps) {
  const defaultLanguage = props.defaultLanguage || "es";

  const onChange = (event: SelectChangeEvent) => {
    props.onChange(event.target.value as string);
  };

  return (
    <Select defaultValue={defaultLanguage} onChange={onChange}>
      {supportedLanguages.map((language) => (
        <MenuItem value={language}>
          {`${langCodeToLanguageName(language)} ${langCodeToFlag(language)}`}
        </MenuItem>
      ))}
    </Select>
  );
}

export default LanguageSelect;
