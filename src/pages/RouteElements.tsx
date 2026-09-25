import { Navigate, Outlet, useLocation, useParams } from "react-router";
import { encodeConfig } from "../widgets/configCodec";
import { parseLegacyHash } from "../widgets/legacy";
import { getWidgetDefinition } from "../widgets/registry";
import NotFound from "./error/NotFound";
import UrlWidgetPage from "./widget/UrlWidgetPage";

export function Root() {
  const { hash } = useLocation();
  const legacy = parseLegacyHash(hash);

  if (legacy === "home") return <Navigate to="/" replace />;
  if (legacy) {
    return (
      <Navigate to={`/${legacy.type}?${encodeConfig(legacy.rawConfig)}`} replace />
    );
  }
  return <Outlet />;
}

export function WidgetTypeRoute() {
  const { type = "" } = useParams();
  const widget = getWidgetDefinition(type);
  if (!widget) return <NotFound message="There is no widget with that name." />;
  return <UrlWidgetPage key={widget.type} widget={widget} />;
}
