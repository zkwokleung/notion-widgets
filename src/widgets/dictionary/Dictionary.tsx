import { useState } from "react";
import type { DictWord, DictionaryConfig } from "../../../shared/widgetConfigs";
import {
  StyledActionButton,
  StyledActionLayout,
  StyledCard,
} from "../../components/StyledComponents";
import DictEntry from "./DictEntry";
import { Add as AddIcon } from "@mui/icons-material";
import OptionsButton from "../../components/OptionsButton";
import { Box, Stack } from "@mui/material";
import DictOptionMenu from "./DictOptionMenu";
import type { WidgetProps } from "../registry";

const DEFAULT_PAIR = { from: "fr", to: "en" };

function Dictionary({ config, onChange, readOnly }: WidgetProps<DictionaryConfig>) {
  const { fixedLang, words } = config;
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);

  const update = (patch: Partial<DictionaryConfig>) => onChange({ ...config, ...patch });

  const updateWord = (index: number, patch: Partial<DictWord>) => {
    update({ words: words.map((word, i) => (i === index ? { ...word, ...patch } : word)) });
  };

  const handleAddWord = () => {
    const pair = fixedLang ?? words.at(-1) ?? DEFAULT_PAIR;
    update({
      words: [...words, { id: crypto.randomUUID(), from: pair.from, to: pair.to, text: "" }],
    });
  };

  const handleFixedLangChange = (enabled: boolean) => {
    if (enabled) {
      update({ fixedLang: words[0] ? { from: words[0].from, to: words[0].to } : DEFAULT_PAIR });
    } else {
      // Keep the pair that was in effect instead of reverting to each word's old one.
      const pair = fixedLang ?? DEFAULT_PAIR;
      update({
        fixedLang: null,
        words: words.map((word) => ({ ...word, from: pair.from, to: pair.to })),
      });
    }
  };

  return (
    <>
      <StyledCard>
        <Stack direction="column" spacing={2}>
          {words.map((word, i) => (
            <DictEntry
              key={word.id}
              index={i}
              hideOriginTTSButton={config.hideOriginTTS}
              hideTranslatedTTSButton={config.hideTranslatedTTS}
              from={fixedLang?.from ?? word.from}
              to={fixedLang?.to ?? word.to}
              text={word.text}
              rate={config.rate}
              fixedLang={!!fixedLang}
              readOnly={readOnly}
              onFromChange={(from, index) => updateWord(index, { from })}
              onToChange={(to, index) => updateWord(index, { to })}
              onTextChange={(text, index) => updateWord(index, { text })}
              onRemove={(index) => update({ words: words.filter((_, j) => j !== index) })}
            />
          ))}
        </Stack>
        {!readOnly && (
          <StyledActionLayout>
            <StyledActionButton onClick={handleAddWord}>
              <AddIcon />
            </StyledActionButton>
            <Box sx={{ marginLeft: "auto" }}>
              <OptionsButton onClick={() => setOptionsMenuOpen(true)} />
            </Box>
          </StyledActionLayout>
        )}
      </StyledCard>

      <DictOptionMenu
        open={optionsMenuOpen}
        onClose={() => setOptionsMenuOpen(false)}
        fixedLang={!!fixedLang}
        hideOriginTTSBtn={config.hideOriginTTS}
        hideTranslatedTTSBtn={config.hideTranslatedTTS}
        from={fixedLang?.from}
        to={fixedLang?.to}
        onHideOriginTTSBtnChange={(hideOriginTTS) => update({ hideOriginTTS })}
        onHideTranslatedTTSBtnChange={(hideTranslatedTTS) => update({ hideTranslatedTTS })}
        onFixedLangChange={handleFixedLangChange}
        onFromChange={(from) => fixedLang && update({ fixedLang: { ...fixedLang, from } })}
        onToChange={(to) => fixedLang && update({ fixedLang: { ...fixedLang, to } })}
      />
    </>
  );
}

export default Dictionary;
