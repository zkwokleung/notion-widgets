import { MenuItem, Select, useMediaQuery, useTheme } from "@mui/material";
import {
  langCodeToLanguageName,
  langCodeToFlag,
  supportedLanguages,
} from "../utils/lang";

export interface LanguageSelectProps {
  lang: string;
  alwaysShowLabel?: boolean;

  availableLangs?: string[];
  onChange: (value: string) => void;
}

function LanguageSelect(props: LanguageSelectProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1190));
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down(600));

  return (
    <Select
      value={props.lang}
      fullWidth
      onChange={(event) => {
        props.onChange(event.target.value as string);
      }}
      IconComponent={isVerySmallScreen ? () => null : undefined}
    >
      {(props.availableLangs || supportedLanguages).map((language) => (
        <MenuItem value={language}>
          {(props.alwaysShowLabel || !isSmallScreen) &&
            langCodeToLanguageName(language)}{" "}
          {langCodeToFlag(language)}
        </MenuItem>
      ))}
    </Select>
  );
}

export default LanguageSelect;
