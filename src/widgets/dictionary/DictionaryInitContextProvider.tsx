import { createContext, useContext } from "react";
import { useSearchParams } from "react-router-dom";

export interface DictWord {
  id: string;
  from: string;
  to: string;
  text: string;
}

interface DictionaryInitContextReturn {
  hideOriginTTSBtn?: boolean;
  hideTranslatedTTSBtn?: boolean;
  fixedFrom?: string | null;
  fixedTo?: string | null;
  words: DictWord[];
}

const DictionaryInitContext = createContext<DictionaryInitContextReturn>({
  words: [{ id: crypto.randomUUID(), from: "fr", to: "en", text: "eau" }],
});

// eslint-disable-next-line react-refresh/only-export-components -- hook is colocated with its provider
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

  const words: DictWord[] = _texts.map((t, i) => ({
    id: crypto.randomUUID(),
    from: _froms[i],
    to: _tos[i],
    text: t,
  }));

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
