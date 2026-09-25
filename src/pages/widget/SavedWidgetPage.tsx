import { CircleAlert, Lock } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useParams, useSearchParams } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { ApiRequestError } from "../../api/client";
import {
  editKeyFromHash,
  loadEditKey,
  rememberEditKey,
  savedWidgetUrl,
} from "../../widgets/editKeys";
import { getWidgetDefinition, parseConfig } from "../../widgets/registry";
import { useSavedWidget, type SaveStatus } from "../../widgets/useSavedWidget";
import { displaySearchOf } from "../displayParams";
import LoadingSpinner from "../LoadingSpinner";
import ShareMenu from "./ShareMenu";
import WidgetFrame from "./WidgetFrame";

const statusLabel: Record<SaveStatus, string> = {
  saved: "Saved",
  saving: "Saving…",
  error: "Couldn't save — will retry on next edit",
};

function LoadProblem({ children }: { children: string }) {
  return (
    <div className="p-3">
      <Alert className="border-border bg-transparent text-muted-foreground">
        <CircleAlert />
        <AlertDescription>{children}</AlertDescription>
      </Alert>
    </div>
  );
}

function SavedWidgetPage() {
  const { id = "" } = useParams();
  const { hash } = useLocation();
  const [searchParams] = useSearchParams();
  const hashKey = editKeyFromHash(hash);
  const editKey = hashKey ?? loadEditKey(id);

  useEffect(() => {
    if (hashKey) rememberEditKey(id, hashKey);
  }, [id, hashKey]);

  const { query, config, setConfig, status } = useSavedWidget(id, editKey);

  if (query.isPending) return <LoadingSpinner />;

  if (query.isError) {
    const notFound = query.error instanceof ApiRequestError && query.error.status === 404;
    return (
      <LoadProblem>
        {notFound ? "This widget doesn't exist or was deleted." : "Couldn't load this widget."}
      </LoadProblem>
    );
  }

  const widget = getWidgetDefinition(query.data.type);
  const parsed = widget && parseConfig(widget, config);
  if (!widget || parsed === undefined) {
    return <LoadProblem>This widget was saved in a format this version can't read.</LoadProblem>;
  }

  const display = displaySearchOf(searchParams);

  return (
    <WidgetFrame
      widget={widget}
      config={parsed}
      onChange={setConfig}
      readOnly={!editKey}
      toolbar={
        editKey ? (
          <>
            <span
              aria-live="polite"
              className={cn("mr-auto px-1", status === "error" && "text-destructive")}
            >
              {statusLabel[status]}
            </span>
            <ShareMenu
              editUrl={savedWidgetUrl(id, editKey, display)}
              readOnlyUrl={savedWidgetUrl(id, undefined, display)}
            />
          </>
        ) : (
          <span className="flex items-center gap-1 px-1">
            <Lock aria-hidden className="size-3" />
            Read-only
          </span>
        )
      }
    />
  );
}

export default SavedWidgetPage;
