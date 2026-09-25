import { Save as SaveIcon } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { createWidget } from "../../api/client";
import CopyLinkButton from "../../components/CopyLinkButton";
import { decodeConfig, encodeConfig } from "../../widgets/configCodec";
import { rememberEditKey } from "../../widgets/editKeys";
import {
  defaultConfig,
  parseConfig,
  type RegisteredWidget,
} from "../../widgets/registry";
import WidgetFrame from "./WidgetFrame";

/** An unsaved widget whose whole config lives in the `?c=` query param. */
function UrlWidgetPage({ widget }: { widget: RegisteredWidget }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const config = useMemo(
    () => parseConfig(widget, decodeConfig(searchParams)) ?? defaultConfig(widget),
    [widget, searchParams]
  );

  const saveWidget = useMutation({
    mutationFn: () => createWidget(widget.type, config),
    onSuccess: ({ id, editKey }) => {
      rememberEditKey(id, editKey);
      void navigate(`/w/${id}#key=${editKey}`);
    },
  });

  return (
    <WidgetFrame
      widget={widget}
      config={config}
      onChange={(next) => setSearchParams(encodeConfig(next), { replace: true })}
      readOnly={false}
      toolbar={
        <>
          <CopyLinkButton label="Copy link" url={window.location.href} />
          <Button
            size="small"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saveWidget.isPending}
            onClick={() => saveWidget.mutate()}
          >
            {saveWidget.isError ? "Save failed — retry" : "Save widget"}
          </Button>
        </>
      }
    />
  );
}

export default UrlWidgetPage;
