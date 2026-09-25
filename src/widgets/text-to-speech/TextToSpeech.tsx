import { Grid } from "@mui/material";
import type {
  SpeechEntry,
  TextToSpeechConfig,
} from "../../../shared/widgetConfigs";
import TTSTextField from "./TTSTextField";
import {
  StyledActionButton,
  StyledActionLayout,
  StyledCard,
} from "../../components/StyledComponents";
import type { WidgetProps } from "../registry";

function TextToSpeech({
  config,
  onChange,
  readOnly,
}: WidgetProps<TextToSpeechConfig>) {
  const { fixedLang, entries, rate } = config;

  const updateEntry = (index: number, patch: Partial<SpeechEntry>) => {
    onChange({
      ...config,
      entries: entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    });
  };

  const handleAddEntry = () => {
    onChange({
      ...config,
      entries: [...entries, { id: crypto.randomUUID(), lang: fixedLang ?? "en", text: "" }],
    });
  };

  return (
    <StyledCard variant="outlined">
      <Grid container rowSpacing={1}>
        {entries.map((entry, idx) => (
          <Grid item xs={12} key={entry.id}>
            <TTSTextField
              id={idx}
              lang={fixedLang ?? entry.lang}
              text={entry.text}
              rate={rate}
              fixedLang={!!fixedLang}
              onLanguageSelected={(lang, index) => updateEntry(index, { lang })}
              onTextChange={(text, index) => updateEntry(index, { text })}
            />
          </Grid>
        ))}
      </Grid>
      {!readOnly && (
        <StyledActionLayout>
          <StyledActionButton onClick={handleAddEntry}>+</StyledActionButton>
        </StyledActionLayout>
      )}
    </StyledCard>
  );
}

export default TextToSpeech;
