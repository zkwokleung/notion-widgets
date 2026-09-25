import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Save } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CopyLinkButton from "@/components/widget/CopyLinkButton";
import { createWidget } from "../../api/client";
import { decodeConfig, withConfig } from "../../widgets/configCodec";
import { rememberEditKey, savedWidgetPath } from "../../widgets/editKeys";
import { defaultConfig, parseConfig, type RegisteredWidget } from "../../widgets/registry";
import { displaySearchOf } from "../displayParams";
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
      void navigate(savedWidgetPath(id, editKey, displaySearchOf(searchParams)));
    },
    onError: () => toast.error("Couldn't save the widget. Try again."),
  });

  return (
    <WidgetFrame
      widget={widget}
      config={config}
      onChange={(next) => setSearchParams((prev) => withConfig(prev, next), { replace: true })}
      readOnly={false}
      toolbar={
        <>
          <CopyLinkButton label="Copy link" url={window.location.href} />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={saveWidget.isPending}
            onClick={() => saveWidget.mutate()}
          >
            {saveWidget.isPending ? <LoaderCircle className="animate-spin" /> : <Save />}
            Save widget
          </Button>
        </>
      }
    />
  );
}

export default UrlWidgetPage;
