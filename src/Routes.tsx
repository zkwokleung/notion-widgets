import { createHashRouter } from "react-router-dom";
import Home from "./pages/home/Home";
import ErrorPage from "./pages/error/ErrorPage";
import Translator from "./widgets/translator/Translator";
import TranslatorInitContextProvider from "./widgets/translator/TranslatorInitContextProvider";
import TextToSpeech from "./widgets/text-to-speech/TextToSpeech";

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
    errorElement: <ErrorPage />,
  },

  {
    path: "/text-to-speech/:lang/:text",
    element: <TextToSpeech />,
    errorElement: <ErrorPage />,
  },
]);

export default router;
