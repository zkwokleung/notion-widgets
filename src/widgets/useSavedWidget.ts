import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { WidgetDocument } from "../../shared/api";
import { getWidget, updateWidget } from "../api/client";

export type SaveStatus = "saved" | "saving" | "error";

const AUTOSAVE_DELAY_MS = 600;

export function useSavedWidget(id: string, editKey: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ["widget", id];

  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => getWidget(id, signal),
    staleTime: Infinity,
  });

  const [draft, setDraft] = useState<unknown>();
  const [dirty, setDirty] = useState(false);

  const { mutate: save, isPending, isError } = useMutation({
    mutationFn: (config: unknown) => updateWidget(id, editKey ?? "", config),
    // Run saves one at a time so an older, slower save can't land last.
    scope: { id: `widget:${id}` },
    onSuccess: (doc) => queryClient.setQueryData<WidgetDocument>(["widget", id], doc),
  });

  useEffect(() => {
    if (!dirty || !editKey) return;
    const timeout = setTimeout(() => {
      setDirty(false);
      save(draft);
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [draft, dirty, editKey, save]);

  // Notion can close the embed at any moment; flush pending edits immediately.
  useEffect(() => {
    if (!dirty || !editKey) return;
    const flush = () => {
      if (document.visibilityState !== "hidden") return;
      setDirty(false);
      updateWidget(id, editKey, draft, { keepalive: true }).catch(() => setDirty(true));
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, [id, draft, dirty, editKey]);

  const setConfig = useCallback(
    (next: unknown) => {
      setDraft(next);
      if (editKey) setDirty(true);
    },
    [editKey]
  );

  const status: SaveStatus = isError ? "error" : dirty || isPending ? "saving" : "saved";

  return {
    query,
    config: draft ?? query.data?.config,
    setConfig,
    status,
  };
}
