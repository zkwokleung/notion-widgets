import { expect, test, type Page } from "@playwright/test";

const dictionary: Record<string, string> = {
  eau: "water",
  pain: "bread",
  vin: "wine",
  hello: "bonjour",
};

// Google-backed endpoints are mocked so runs are deterministic; the widget API and
// its KV storage run for real in workerd.
async function mockExternalApis(page: Page) {
  await page.route("**/api/translate?*", (route) => {
    const q = new URL(route.request().url()).searchParams.get("q") ?? "";
    return route.fulfill({ json: { text: dictionary[q] ?? `[${q}]` } });
  });
  await page.route("**/api/tts?*", (route) =>
    route.fulfill({ body: Buffer.alloc(0), contentType: "audio/mpeg" })
  );
  await page.route("**/api/handwriting", (route) =>
    route.fulfill({ json: { candidates: ["十", "+"] } })
  );
}

const wordInputs = (page: Page) => page.getByRole("textbox", { name: "Word", exact: true });

test.beforeEach(async ({ page }) => {
  await mockExternalApis(page);
});

test("home lists every widget and links to its builder", async ({ page }) => {
  await page.goto("/");
  for (const title of ["Translator", "Text-to-Speech", "Dictionary", "Focus Timer", "Handwriting"]) {
    await expect(page.getByRole("link", { name: new RegExp(title) })).toBeVisible();
  }
  await page.getByRole("link", { name: /Dictionary/ }).click();
  await expect(page).toHaveURL(/\/new\/dictionary$/);
  await expect(page.getByRole("button", { name: "Create embed link" })).toBeVisible();
});

test("a saved dictionary persists edits and has a read-only link", async ({ page, browser }) => {
  await page.goto("/new/dictionary");
  await page.getByRole("button", { name: "Add word" }).click();
  await wordInputs(page).fill("eau");
  await expect(page.getByText("water")).toBeVisible();

  await page.getByRole("button", { name: "Create embed link" }).click();
  const editable = await page.getByLabel("Embed link (can edit)").inputValue();
  const readOnly = await page.getByLabel("Read-only link").inputValue();
  expect(editable).toMatch(/\/w\/[\w-]+#key=/);

  await page.goto(editable);
  await wordInputs(page).first().press("Enter");
  await wordInputs(page).nth(1).fill("pain");
  await expect(page.getByText("bread")).toBeVisible();
  await expect(page.getByText("Saved")).toBeVisible();

  await page.reload();
  await expect(wordInputs(page).nth(1)).toHaveValue("pain");

  // Another viewer: a fresh context has no remembered edit key.
  const viewer = await browser.newPage();
  await mockExternalApis(viewer);
  await viewer.goto(readOnly);
  await expect(wordInputs(viewer).nth(1)).toHaveValue("pain");
  await expect(viewer.getByRole("button", { name: "Remove word" })).toHaveCount(0);
  await expect(viewer.getByText("Read-only")).toBeVisible();
  await viewer.close();
});

test("old hash links from the previous app still open", async ({ page }) => {
  await page.goto("/#/dictionary?from=fr&to=en&text=eau&from=fr&to=en&text=vin");
  await expect(page).toHaveURL(/\/dictionary\?c=/);
  await expect(wordInputs(page).first()).toHaveValue("eau");
  await expect(page.getByText("wine")).toBeVisible();
});

test("translator translates into every target language", async ({ page }) => {
  await page.goto("/translator");
  await page.getByLabel("Text to translate").fill("hello");
  await expect(page.getByRole("list", { name: "Translations" }).getByText("bonjour").first()).toBeVisible();
});

test("dictionary study mode grades a card", async ({ page }) => {
  await page.goto("/#/dictionary?from=fr&to=en&text=eau");
  await page.getByRole("radio", { name: /Study/ }).click();
  await page.getByRole("button", { name: "Show answer" }).click();
  await expect(page.getByText("water")).toBeVisible();
  await page.getByRole("button", { name: /^Good/ }).click();
  await expect(page.getByText("All caught up")).toBeVisible();
});

test("focus timer starts and pauses", async ({ page }) => {
  await page.goto("/timer");
  await expect(page.getByRole("timer")).toHaveText("25:00");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("timer")).not.toHaveText("25:00", { timeout: 3000 });
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
});

test("handwriting turns strokes into text", async ({ page }) => {
  await page.goto("/whiteboard");
  const canvas = page.getByRole("img", { name: "Handwriting area" });
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + 30, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 30, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();

  await page.getByRole("button", { name: "十" }).click();
  await expect(page.getByRole("textbox", { name: "Written text", exact: true })).toHaveValue("十");
});

test("display options apply the theme and transparency", async ({ page }) => {
  await page.goto("/translator?theme=dark&bg=transparent");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("html")).toHaveAttribute("data-bg", "transparent");
});
