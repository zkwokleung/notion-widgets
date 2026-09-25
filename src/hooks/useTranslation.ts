import { keepPreviousData, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { translate } from "../api/client";

function translationQuery(text: string, from: string, to: string) {
  return queryOptions({
    queryKey: ["translate", from, to, text],
    queryFn: ({ signal }) => translate(text, from, to, signal),
    staleTime: Infinity,
  });
}

export function useTranslation(text: string, from: string, to: string) {
  const enabled = !!text && !!from && !!to;

  const { data } = useQuery({
    ...translationQuery(text, from, to),
    enabled,
    placeholderData: keepPreviousData,
  });

  return enabled ? (data ?? "") : "";
}

/** Imperative lookup sharing the cache with `useTranslation`, for batch work like export. */
export function useFetchTranslation() {
  const queryClient = useQueryClient();
  return useCallback(
    (text: string, from: string, to: string) =>
      text ? queryClient.fetchQuery(translationQuery(text, from, to)) : Promise.resolve(""),
    [queryClient]
  );
}
