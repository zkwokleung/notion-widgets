import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home/Home";
import ErrorPage from "./pages/error/ErrorPage";
import Translator from "./widgets/translator/Translator";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },

  // Alias for the home page
  {
    path: "/notion-widgets",
    element: <Home />,
    errorElement: <ErrorPage />,
  },

  {
    path: "/translator",
    element: <Translator />,
  },
]);

export default router;
