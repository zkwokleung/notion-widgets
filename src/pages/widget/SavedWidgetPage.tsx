import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router";
import { ApiRequestError } from "../../api/client";
import CopyLinkButton from "../../components/CopyLinkButton";
import {
  editKeyFromHash,
  loadEditKey,
  rememberEditKey,
  savedWidgetUrl,
} from "../../widgets/editKeys";
import { getWidgetDefinition, parseConfig } from "../../widgets/registry";
import { useSavedWidget, type SaveStatus } from "../../widgets/useSavedWidget";
import WidgetFrame from "./WidgetFrame";

const statusLabel: Record<SaveStatus, string> = {
  saved: "Saved",
  saving: "Saving…",
  error: "Couldn't save — will retry on next edit",
};

function SavedWidgetPage() {
  const { id = "" } = useParams();
  const { hash } = useLocation();
  const hashKey = editKeyFromHash(hash);
  const editKey = hashKey ?? loadEditKey(id);

  useEffect(() => {
    if (hashKey) rememberEditKey(id, hashKey);
  }, [id, hashKey]);

  const { query, config, setConfig, status } = useSavedWidget(id, editKey);

  if (query.isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (query.isError) {
    const notFound =
      query.error instanceof ApiRequestError && query.error.status === 404;
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {notFound ? "This widget doesn't exist or was deleted." : "Couldn't load this widget."}
      </Alert>
    );
  }

  const widget = getWidgetDefinition(query.data.type);
  const parsed = widget && parseConfig(widget, config);
  if (!widget || parsed === undefined) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        This widget was saved in a format this version can't read.
      </Alert>
    );
  }

  const readOnly = !editKey;

  return (
    <WidgetFrame
      widget={widget}
      config={parsed}
      onChange={setConfig}
      readOnly={readOnly}
      toolbar={
        <>
          {!readOnly && (
            <Typography
              variant="caption"
              color={status === "error" ? "error" : "text.secondary"}
              sx={{ alignSelf: "center", mr: "auto" }}
            >
              {statusLabel[status]}
            </Typography>
          )}
          <CopyLinkButton label="Copy read-only link" url={savedWidgetUrl(id)} />
          {!readOnly && (
            <CopyLinkButton label="Copy embed link" url={savedWidgetUrl(id, editKey)} />
          )}
        </>
      }
    />
  );
}

export default SavedWidgetPage;
