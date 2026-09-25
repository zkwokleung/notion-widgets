import type { Meta, StoryObj } from "@storybook/react-vite";
import Translator from "../widgets/translator/Translator";

const meta = {
  title: "Widget/Translator",
  component: Translator,
  tags: ["autodocs"],
} satisfies Meta<typeof Translator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
