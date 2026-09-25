import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  translatorConfigSchema,
  type TranslatorConfig,
} from "../../shared/widgetConfigs";
import Translator from "../widgets/translator/Translator";

function StatefulTranslator({ readOnly }: { readOnly: boolean }) {
  const [config, setConfig] = useState<TranslatorConfig>(() =>
    translatorConfigSchema.parse({})
  );
  return (
    <TooltipProvider>
      <Translator config={config} onChange={setConfig} readOnly={readOnly} />
    </TooltipProvider>
  );
}

const meta = {
  title: "Widget/Translator",
  component: StatefulTranslator,
  tags: ["autodocs"],
  args: { readOnly: false },
} satisfies Meta<typeof StatefulTranslator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Editable: Story = {};
export const ReadOnly: Story = { args: { readOnly: true } };
