import type { Preview } from "@storybook/react-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { createQueryClient } from "../src/api/queryClient";
import { TooltipProvider } from "../src/components/ui/tooltip";
import "../src/index.css";

const queryClient = createQueryClient();

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Notion theme",
      toolbar: { title: "Theme", items: ["light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <MemoryRouter>
            <div className={`${context.globals.theme} bg-background p-4 text-foreground`}>
              <Story />
            </div>
          </MemoryRouter>
        </TooltipProvider>
      </QueryClientProvider>
    ),
  ],
};

export default preview;
