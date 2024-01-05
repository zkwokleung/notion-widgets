import { createContext, useContext } from "react";
import { useParams, useSearchParams } from "react-router-dom";

interface TextToSpeechInitContextReturn {
  speechTexts: { lang: string; text: string }[];
}

const TextToSpeechInitContext = createContext<TextToSpeechInitContextReturn>({
  speechTexts: [{ lang: "fr", text: "eau" }],
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

  const speechTexts = [
    ...new Set(
      fixedLang
        ? _texts.map((text) => ({ lang: fixedLang, text }))
        : _langs
            .map((lang, i) => ({ lang, text: _texts[i] ?? "" }))
            .filter((lang) => lang.lang)
    ),
  ];

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
