import type { Meta, StoryObj } from "@storybook/react";
import Translator from "../widgets/translator/Translator";

const meta = {
  title: "Widget/Translator",
  component: Translator,
  parameters: {},

  tags: ["autodocs"],

  argTypes: {
    backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof Translator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
