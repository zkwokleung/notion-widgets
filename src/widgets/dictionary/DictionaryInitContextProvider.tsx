import { createContext, useContext } from "react";
import { useParams, useSearchParams } from "react-router-dom";

interface DictionaryInitContextReturn {
  fixedFrom?: string;
  fixedTo?: string;
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
  // URL Params
  const { from: fixedFrom, to: fixedTo } = useParams<{
    from: string;
    to: string;
  }>();

  // Search Params
  const [search] = useSearchParams();
  const _froms = search.getAll("from");
  const _tos = search.getAll("to");
  const _texts = search.getAll("text");

  const words = [
    ...new Set(
      _texts.map((t, i) => ({
        from: _froms[i] ?? "fr",
        to: _tos[i] ?? "en",
        text: t,
      }))
    ),
  ];

  const ctx: DictionaryInitContextReturn = {
    fixedFrom,
    fixedTo,
    words,
  };

  return (
    <DictionaryInitContext.Provider value={ctx}>
      {children}
    </DictionaryInitContext.Provider>
  );
};

export default DictionaryInitContextProvider;
