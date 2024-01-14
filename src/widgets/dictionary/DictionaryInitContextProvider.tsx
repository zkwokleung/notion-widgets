import { createContext, useContext } from "react";
import { useSearchParams } from "react-router-dom";

interface DictionaryInitContextReturn {
  hideOriginTTSBtn?: boolean;
  hideTranslatedTTSBtn?: boolean;
  fixedFrom?: string | null;
  fixedTo?: string | null;
  words: { from: string; to: string; text: string }[];
}

const DictionaryInitContext = createContext<DictionaryInitContextReturn>({
  words: [{ from: "fr", to: "en", text: "eau" }],
});

export function useDictionaryInitContext() {
  return useContext(DictionaryInitContext);
}

const DictionaryInitContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Search Params
  const [search] = useSearchParams();
  const _fixedFrom = search.get("fixedFrom");
  const _fixedTo = search.get("fixedTo");
  const _froms = search.getAll("from");
  const _tos = search.getAll("to");
  const _texts = search.getAll("text");
  const _hideOriginTTSBtn = search.get("hotb");
  const _hideTranslatedTTSBtn = search.get("httb");

  const words = [
    ...new Set(
      _texts.map((t, i) => ({
        from: _froms[i],
        to: _tos[i],
        text: t,
      }))
    ),
  ];

  const ctx: DictionaryInitContextReturn = {
    hideOriginTTSBtn: _hideOriginTTSBtn === "true",
    hideTranslatedTTSBtn: _hideTranslatedTTSBtn === "true",
    fixedFrom: _fixedFrom,
    fixedTo: _fixedTo,
    words,
  };

  return (
    <DictionaryInitContext.Provider value={ctx}>
      {children}
    </DictionaryInitContext.Provider>
  );
};

export default DictionaryInitContextProvider;
