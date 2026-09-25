import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { translateTo } from "../widgets/translator/translatorUitls";

export function useTranslation(text: string, from: string, to: string) {
  const enabled = !!text && !!from && !!to;

  const { data } = useQuery({
    queryKey: ["translate", from, to, text],
    queryFn: ({ signal }) => translateTo(text, from, to, signal),
    enabled,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });

  return enabled ? (data ?? "") : "";
}
