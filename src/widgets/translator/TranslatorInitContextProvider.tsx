import { createContext, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { supportedLanguages } from "../../utils/lang";

interface TranslatorInitContextReturn {
  from: string;
  to: string[];
}

const TranslatorInitContext = createContext<TranslatorInitContextReturn>({
  from: "en",
  to: [],
});

// eslint-disable-next-line react-refresh/only-export-components -- hook is colocated with its provider
export function useTranslatorInitContext() {
  return useContext(TranslatorInitContext);
}

const TranslatorInitContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [search] = useSearchParams();
  const _from = search.get("from");

  const from =
    _from === null || !supportedLanguages.includes(_from) ? "en" : _from;

  const _to = search.getAll("to");

  const to = [
    ...new Set(
      _to.filter((lang) => supportedLanguages.includes(lang) && lang !== from)
    ),
  ];

  const ctx: TranslatorInitContextReturn = {
    from,
    to,
  };

  return (
    <TranslatorInitContext.Provider value={ctx}>
      {children}
    </TranslatorInitContext.Provider>
  );
};

export default TranslatorInitContextProvider;
