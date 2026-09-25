import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: "@storybook/react-vite",
  staticDirs: ["../public"],
  // The Cloudflare plugin can't run inside Storybook's Vite server.
  viteFinal: (config) => ({
    ...config,
    plugins: config.plugins?.flat().filter(
      (plugin) =>
        !(plugin && "name" in plugin && plugin.name.startsWith("vite-plugin-cloudflare"))
    ),
  }),
};

export default config;
