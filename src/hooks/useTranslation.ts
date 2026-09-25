import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { translate } from "../api/client";

export function useTranslation(text: string, from: string, to: string) {
  const enabled = !!text && !!from && !!to;

  const { data } = useQuery({
    queryKey: ["translate", from, to, text],
    queryFn: ({ signal }) => translate(text, from, to, signal),
    enabled,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });

  return enabled ? (data ?? "") : "";
}
