import { Divider, Grid } from "@mui/material";
import { useState } from "react";
import type { TranslatorConfig } from "../../../shared/widgetConfigs";
import TranslatorTextField from "./TranslatorTextField";
import { supportedLanguages } from "../../utils/lang";
import { useDebounce } from "../../hooks/useDebounce";
import {
  StyledActionLayout,
  StyledActionButton,
  StyledCard,
  StyledGrid,
} from "../../components/StyledComponents";
import type { WidgetProps } from "../registry";

export default function Translator({
  config,
  onChange,
  readOnly,
}: WidgetProps<TranslatorConfig>) {
  const [text, setText] = useState("");
  const textToTranslate = useDebounce(text, 500);
  const { from, to } = config;

  const unusedLanguages = supportedLanguages.filter(
    (lang) => lang !== from && !to.includes(lang)
  );

  const handleFromChange = (value: string) => {
    onChange({ from: value, to: to.filter((lang) => lang !== value) });
  };

  const handleToLangChange = (lang: string, newLang: string) => {
    onChange({ from, to: to.map((current) => (current === lang ? newLang : current)) });
  };

  const handleAddToLang = () => {
    if (unusedLanguages[0]) onChange({ from, to: [...to, unusedLanguages[0]] });
  };

  const handleRemoveToLang = (lang: string) => {
    onChange({ from, to: to.filter((current) => current !== lang) });
  };

  return (
    <StyledCard variant="outlined">
      <Grid container rowSpacing={1}>
        <StyledGrid item xs={12}>
          <TranslatorTextField
            input
            lang={from}
            onLangChange={handleFromChange}
            onTextChange={setText}
            placeholder="Type something to translate..."
          />
        </StyledGrid>

        <StyledGrid item xs={12}>
          <Divider textAlign="left" variant="middle" flexItem>
            Translations
          </Divider>
        </StyledGrid>

        {to.map((lang) => (
          <StyledGrid item xs={12} key={lang}>
            <TranslatorTextField
              fromLang={from}
              text={textToTranslate}
              lang={lang}
              onLangChange={(newLang) => handleToLangChange(lang, newLang)}
              onRemoveLang={readOnly ? undefined : handleRemoveToLang}
              availableLangs={[...unusedLanguages, lang]}
            />
          </StyledGrid>
        ))}
      </Grid>
      {!readOnly && (
        <StyledActionLayout>
          <StyledActionButton
            onClick={handleAddToLang}
            aria-disabled={unusedLanguages.length === 0}
          >
            +
          </StyledActionButton>
        </StyledActionLayout>
      )}
    </StyledCard>
  );
}
