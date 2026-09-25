import { createContext, useContext } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export interface SpeechText {
  id: string;
  lang: string;
  text: string;
}

interface TextToSpeechInitContextReturn {
  speechTexts: SpeechText[];
}

const TextToSpeechInitContext = createContext<TextToSpeechInitContextReturn>({
  speechTexts: [{ id: crypto.randomUUID(), lang: "fr", text: "eau" }],
});

export function useTextToSpeechInitContext() {
  return useContext(TextToSpeechInitContext);
}

const TextToSpeechInitContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [search] = useSearchParams();
  const { lang: fixedLang } = useParams<{ lang: string }>();

  const _langs = search.getAll("lang");
  const _texts = search.getAll("text");

  const speechTexts: SpeechText[] = fixedLang
    ? _texts.map((text) => ({ id: crypto.randomUUID(), lang: fixedLang, text }))
    : _langs
        .map((lang, i) => ({
          id: crypto.randomUUID(),
          lang,
          text: _texts[i] ?? "",
        }))
        .filter((speechText) => speechText.lang);

  const ctx: TextToSpeechInitContextReturn = {
    speechTexts,
  };

  return (
    <TextToSpeechInitContext.Provider value={ctx}>
      {children}
    </TextToSpeechInitContext.Provider>
  );
};

export default TextToSpeechInitContextProvider;
