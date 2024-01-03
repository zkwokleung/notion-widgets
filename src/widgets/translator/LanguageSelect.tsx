import React from "react";
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1190));

  const defaultLanguage = props.defaultLanguage || "es";

  const onChange = (event: SelectChangeEvent) => {
    props.onChange(event.target.value as string);
  };

  return (
    <Select defaultValue={defaultLanguage} fullWidth onChange={onChange}>
      {supportedLanguages.map((language) => (
        <MenuItem value={language}>
          {!isSmallScreen && langCodeToLanguageName(language)}{" "}
          {langCodeToFlag(language)}
        </MenuItem>
      ))}
    </Select>
  );
}

export default LanguageSelect;
