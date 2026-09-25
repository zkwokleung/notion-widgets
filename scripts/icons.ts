/**
 * Regenerates every raster icon from the widget-grid mark.
 *
 * `public/favicon.svg` is the hand-written source of truth. This script
 * re-draws the same mark with different framing for each target, then
 * rasterizes it with sharp:
 *
 *   favicon.ico            16/32/48, rounded tile on transparent
 *   icon-192.png, -512.png rounded tile on transparent (manifest purpose "any")
 *   apple-touch-icon.png   180, full-bleed square, iOS applies its own mask
 *   icon-512-maskable.png  full-bleed square, mark inset to the 80% safe zone
 *
 * Run with `bun run icons`.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const BLUE = "#2383e2";
const OUT_DIR = resolve(import.meta.dirname, "../public");

type Frame = {
  /** Corner radius of the background tile, in 64-unit viewBox space. */
  tileRadius: number;
  /** Scale applied to the 2×2 grid around the tile centre. 1 = favicon.svg. */
  markScale: number;
};

const ROUNDED: Frame = { tileRadius: 14, markScale: 1 };
const FULL_BLEED: Frame = { tileRadius: 0, markScale: 1 };
const MASKABLE: Frame = { tileRadius: 0, markScale: 0.8 };

function cell(x: number, y: number, opacity = 1): string {
  const alpha = opacity === 1 ? "" : ` fill-opacity="${opacity}"`;
  return `<rect x="${x}" y="${y}" width="18" height="18" rx="4" fill="#fff"${alpha}/>`;
}

function svg({ tileRadius, markScale }: Frame): string {
  const offset = 32 - 32 * markScale;
  const transform =
    markScale === 1 ? "" : ` transform="translate(${offset} ${offset}) scale(${markScale})"`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">`,
    `<rect width="64" height="64" rx="${tileRadius}" fill="${BLUE}"/>`,
    `<g${transform}>`,
    cell(12, 12),
    cell(34, 12),
    cell(12, 34),
    cell(34, 34, 0.42),
    `</g>`,
    `</svg>`,
  ].join("");
}

async function png(frame: Frame, size: number): Promise<Buffer> {
  // Render at a high density so the rounded corners are supersampled.
  return sharp(Buffer.from(svg(frame)), { density: (72 * size) / 64 })
    .resize(size, size)
    .png()
    .toBuffer();
}

async function write(name: string, data: Buffer): Promise<void> {
  await writeFile(resolve(OUT_DIR, name), data);
  console.log(`${name.padEnd(24)} ${data.byteLength} bytes`);
}

await mkdir(OUT_DIR, { recursive: true });

const icoSizes = [16, 32, 48];
const icoFrames = await Promise.all(icoSizes.map((size) => png(ROUNDED, size)));
await write("favicon.ico", await pngToIco(icoFrames));
await write("icon-192.png", await png(ROUNDED, 192));
await write("icon-512.png", await png(ROUNDED, 512));
await write("apple-touch-icon.png", await png(FULL_BLEED, 180));
await write("icon-512-maskable.png", await png(MASKABLE, 512));
