import {
  MenuItem,
  Select,
  SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { langCodeToFlag, langCodeToLanguageName } from "./translate";

export interface LanguageSelectProps {
  onChange: (value: string) => void;
  lang: string;
  availableLangs: string[];
}

function LanguageSelect(props: LanguageSelectProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1190));

  const onChange = (event: SelectChangeEvent) => {
    props.onChange(event.target.value as string);
  };

  return (
    <Select value={props.lang} fullWidth onChange={onChange}>
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
