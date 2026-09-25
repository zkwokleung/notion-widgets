# Notion Widgets

Small language-learning widgets you can embed in any Notion page. They follow
Notion's light/dark theme and save changes in place, so an embed never has to be
re-copied after you edit it.

| Widget | What it does |
|---|---|
| **Translator** | Translate text into several languages at once; swap, copy, listen. |
| **Text-to-Speech** | A list of words or phrases to listen to, with Play all and speed control. |
| **Dictionary** | A vocabulary list with live translations, pronunciation, spaced-repetition flashcards (SM-2), Play all, and CSV import/export. |
| **Focus Timer** | A Pomodoro timer (focus / short break / long break) that survives Notion reloading the embed. |
| **Handwriting** | Draw characters you can't type yet (kanji, hanzi, hangul…), then translate and hear them. |
| **Countdown** | Count down to a date (or up from it), with your choice of layout, units, font, size and colour. |

## Embedding in Notion

1. Open the app's home page and pick a widget. The builder shows a live preview.
2. Choose a theme (Auto follows the viewer's system, like Notion) and whether the
   background is transparent, then **Create embed link**.
3. In Notion, type `/embed`, paste the link, and resize the block.

You get two links:

- **Embed link (can edit)** — contains the edit key after `#key=`. Anyone with it can
  change the widget, so keep it in private pages. The key lives in the URL fragment,
  which browsers never send to the server.
- **Read-only link** — the same widget without editing.

Edits autosave. Widgets can also be used without saving: `/<widget>` keeps the whole
config in the `?c=` query parameter.

### Display options

Add these to any widget URL:

| Param | Effect |
|---|---|
| `theme=light` / `theme=dark` | Force a theme instead of following the system. |
| `bg=transparent` | Let the Notion page show through the widget. |

### Old links

Links from the previous GitHub Pages version (`#/translator?...`, `#/text-to-speech/fr?...`,
`#/dictionary?...`) still work: they redirect to the new URLs with their words intact.

## Development

Requires [Bun](https://bun.sh) 1.3+ and Node 24 (Vite, Vitest and Wrangler run on Node).

```bash
bun install
bun run dev        # app + Worker API (workerd) at http://localhost:5173
bun run test       # Vitest: app (jsdom) and worker (node) projects
bun run test:e2e   # Playwright against the production build, desktop + narrow
bun run typecheck  # tsc -b across app, worker and config projects
bun run lint
bun run storybook
```

`bun run dev` runs the Worker in the real Cloudflare runtime with local KV, so saved
widgets work offline. After changing `wrangler.jsonc`, run `bun run cf-typegen`.

### Layout

```
shared/          request/response types and Zod config schemas (app + worker)
worker/          Hono API on Cloudflare Workers
  routes/        translate, tts, handwriting (Google proxies) and widgets (KV)
src/
  widgets/       one folder per widget + registry.ts, which drives routes and home
  pages/         home, embed builder, saved/unsaved widget pages
  components/ui/ shadcn/ui components (generated)
  components/widget/  shared LanguagePicker, SpeakButton, CopyLinkButton
  hooks/         useTranslation (TanStack Query), useSpeech, useDebounce
  lib/           SM-2 scheduling, CSV, display options
e2e/             Playwright specs
```

To add a widget: add its config schema to `shared/widgetConfigs.ts`, its type to
`WIDGET_TYPES`, a folder under `src/widgets/`, and an entry in `src/widgets/registry.ts`.

## Deploying

The app is a single Cloudflare Worker that serves the static build and the `/api/*`
routes.

```bash
bunx wrangler login
bun run deploy
```

The `WIDGETS` KV namespace is created automatically on the first deploy. Edge caching
of translations and audio only takes effect on a custom domain, not on `*.workers.dev`.

## Limits and notes

- Translation, text-to-speech fallback and handwriting recognition use Google's free,
  unofficial endpoints through the Worker. They work well for personal use but can
  change or rate-limit without notice.
- Speech uses the browser's own voices when one exists for the language and falls
  back to Google TTS otherwise.
- Study progress is stored per word in the widget, so it follows the widget, not the
  device.
