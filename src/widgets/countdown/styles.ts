import type { CSSProperties } from "react";
import type { CountdownColor, CountdownFont } from "../../../shared/widgetConfigs";

interface FontOption {
  label: string;
  /** CSS font-family; undefined keeps Notion's system stack. */
  family?: string;
  /** Loads the self-hosted font files; only runs once the font is chosen. */
  load?: () => Promise<unknown>;
}

// Explicit import paths so Vite can split each font's CSS into its own chunk.
export const FONTS: Record<CountdownFont, FontOption> = {
  system: { label: "Default" },
  serif: {
    label: "Serif",
    family: '"Playfair Display Variable", Georgia, serif',
    load: () => import("@fontsource-variable/playfair-display/index.css"),
  },
  mono: {
    label: "Mono",
    family: '"Space Mono", ui-monospace, monospace',
    load: () => import("@fontsource/space-mono/index.css"),
  },
  display: {
    label: "Display",
    family: '"Bebas Neue", Impact, sans-serif',
    load: () => import("@fontsource/bebas-neue/index.css"),
  },
  rounded: {
    label: "Rounded",
    family: '"Nunito Variable", ui-rounded, sans-serif',
    load: () => import("@fontsource-variable/nunito/index.css"),
  },
  script: {
    label: "Handwritten",
    family: '"Caveat Variable", cursive',
    load: () => import("@fontsource-variable/caveat/index.css"),
  },
};

const loaded = new Map<CountdownFont, Promise<unknown>>();

/** Loads a font once; later calls return the same promise. */
export function loadFont(font: CountdownFont): Promise<unknown> {
  const { load } = FONTS[font];
  if (!load) return Promise.resolve();
  let pending = loaded.get(font);
  if (!pending) {
    pending = load();
    loaded.set(font, pending);
  }
  return pending;
}

/** Notion's text colours in its light and dark themes. */
export const COLORS: Record<CountdownColor, { label: string; light: string; dark: string }> = {
  default: { label: "Default", light: "var(--foreground)", dark: "var(--foreground)" },
  gray: { label: "Gray", light: "#787774", dark: "#9b9b9b" },
  brown: { label: "Brown", light: "#9f6b53", dark: "#ba856f" },
  orange: { label: "Orange", light: "#d9730d", dark: "#c77d48" },
  yellow: { label: "Yellow", light: "#cb912f", dark: "#ca8f3c" },
  green: { label: "Green", light: "#448361", dark: "#4f9768" },
  blue: { label: "Blue", light: "#337ea9", dark: "#5e87c9" },
  purple: { label: "Purple", light: "#9065b0", dark: "#9d68d3" },
  pink: { label: "Pink", light: "#c14c8a", dark: "#d15796" },
  red: { label: "Red", light: "#d44c47", dark: "#df5452" },
};

export function isPresetColor(color: string): color is CountdownColor {
  return Object.hasOwn(COLORS, color);
}

/** CSS variables the display reads as `text-(--cd-light) dark:text-(--cd-dark)`. */
export function accentVars(color: string): CSSProperties {
  const { light, dark } = isPresetColor(color) ? COLORS[color] : { light: color, dark: color };
  return { "--cd-light": light, "--cd-dark": dark } as CSSProperties;
}
