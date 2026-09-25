import { createBrowserRouter, type RouteObject } from "react-router";
import ErrorPage from "./pages/error/ErrorPage";
import NotFound from "./pages/error/NotFound";
import Home from "./pages/home/Home";
import { Root, WidgetBuilderRoute, WidgetTypeRoute } from "./pages/RouteElements";
import SavedWidgetPage from "./pages/widget/SavedWidgetPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      // Old GitHub Pages path; its hash links are handled by Root.
      { path: "notion-widgets", element: <Home /> },
      { path: "w/:id", element: <SavedWidgetPage /> },
      { path: "new/:type", element: <WidgetBuilderRoute /> },
      { path: ":type", element: <WidgetTypeRoute /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export default createBrowserRouter(routes);
