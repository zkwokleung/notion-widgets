import { MenuItem, Select, useMediaQuery, useTheme } from "@mui/material";
import { langCodeToLanguageName, langCodeToFlag } from "../utils/lang";

export interface LanguageSelectProps {
  lang: string;
  availableLangs: string[];
  onChange: (value: string) => void;
}

function LanguageSelect(props: LanguageSelectProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1190));

  return (
    <Select
      value={props.lang}
      fullWidth
      onChange={(event) => {
        props.onChange(event.target.value as string);
      }}
    >
      {props.availableLangs.map((language) => (
        <MenuItem value={language}>
          {!isSmallScreen && langCodeToLanguageName(language)}{" "}
          {langCodeToFlag(language)}
        </MenuItem>
      ))}
    </Select>
  );
}

export default LanguageSelect;
