import { createHashRouter } from "react-router-dom";
import Home from "./pages/home/Home";
import ErrorPage from "./pages/error/ErrorPage";
import Translator from "./widgets/translator/Translator";
import TranslatorInitContextProvider from "./widgets/translator/TranslatorInitContextProvider";

const router = createHashRouter([
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
    element: (
      <TranslatorInitContextProvider>
        <Translator />
      </TranslatorInitContextProvider>
    ),
  },
]);

export default router;
