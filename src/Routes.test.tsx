import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createQueryClient } from "./api/queryClient";
import { routes } from "./Routes";
import { decodeConfig, encodeConfig, withConfig } from "./widgets/configCodec";
import { savedWidgetPath } from "./widgets/editKeys";

function renderAt(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  render(
    <QueryClientProvider client={createQueryClient()}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
  return router;
}

const eauConfig = { words: [{ id: "w1", from: "fr", to: "en", text: "eau" }] };

const savedDoc = {
  id: "abc123",
  type: "dictionary",
  updatedAt: "2026-09-25T00:00:00.000Z",
  config: eauConfig,
};

describe("routes", () => {
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url === "/api/widgets" && init?.method === "POST") {
        return Promise.resolve(Response.json({ id: "new1", editKey: "k1" }, { status: 201 }));
      }
      if (url.startsWith("/api/widgets/abc123")) {
        const body = init?.body ? JSON.parse(String(init.body)) : undefined;
        return Promise.resolve(
          Response.json(body ? { ...savedDoc, config: body.config } : savedDoc)
        );
      }
      return Promise.resolve(Response.json({ text: "water" }));
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("redirects legacy hash links to the new widget URL", async () => {
    const router = renderAt("/#/dictionary?from=fr&to=en&text=eau");

    expect(await screen.findByDisplayValue("eau")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/dictionary");
    const config = decodeConfig(new URLSearchParams(router.state.location.search));
    expect(config).toMatchObject({ words: [{ from: "fr", to: "en", text: "eau" }] });
  });

  it("keeps display params when editing an unsaved widget", async () => {
    const router = renderAt(`/dictionary?theme=dark&bg=transparent&${encodeConfig(eauConfig)}`);

    await userEvent.type(await screen.findByDisplayValue("eau"), "x");

    await waitFor(() => {
      const search = new URLSearchParams(router.state.location.search);
      expect(decodeConfig(search)).toMatchObject({ words: [{ text: "eaux" }] });
    });
    const search = new URLSearchParams(router.state.location.search);
    expect(search.get("theme")).toBe("dark");
    expect(search.get("bg")).toBe("transparent");
  });

  it("saves an unsaved widget and keeps its display params", async () => {
    const router = renderAt(`/dictionary?theme=dark&${encodeConfig(eauConfig)}`);

    await userEvent.click(await screen.findByRole("button", { name: "Save widget" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/w/new1"));
    expect(router.state.location.search).toBe("?theme=dark");
    expect(router.state.location.hash).toBe("#key=k1");
  });

  it("autosaves edits to a saved widget with the key from the link", async () => {
    renderAt("/w/abc123#key=secret");

    const input = await screen.findByDisplayValue("eau");
    await userEvent.type(input, "x");

    await waitFor(
      () => {
        const put = fetchMock.mock.calls.find(([, init]) => init?.method === "PUT");
        expect(put).toBeDefined();
        const [, init] = put!;
        expect(new Headers(init?.headers).get("X-Edit-Key")).toBe("secret");
        expect(JSON.parse(String(init?.body)).config.words[0].text).toBe("eaux");
      },
      { timeout: 3000 }
    );
    expect(await screen.findByText("Saved")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Share/ }));
    expect(
      await screen.findByRole("menuitem", { name: /Copy embed link/ })
    ).toBeInTheDocument();
  });

  it("shows saved widgets without a key as read-only", async () => {
    renderAt("/w/abc123");

    expect(await screen.findByDisplayValue("eau")).toBeInTheDocument();
    expect(screen.getByText("Read-only")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Share/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Copy embed link/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove word" })).not.toBeInTheDocument();
  });

  it("shows not-found messages for missing widgets and unknown paths", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(Response.json({ error: "Widget not found" }, { status: 404 }))
    );

    renderAt("/w/missing");
    expect(await screen.findByText(/doesn't exist or was deleted/)).toBeInTheDocument();
  });

  it("shows a not-found message for unknown widget types", async () => {
    renderAt("/not-a-widget");
    expect(await screen.findByText(/no widget with that name/)).toBeInTheDocument();
  });

  it("links each widget on the home page to its builder", async () => {
    renderAt("/");
    expect(await screen.findByRole("link", { name: /Dictionary/ })).toHaveAttribute(
      "href",
      "/new/dictionary"
    );
  });

  it("creates an embed link from the builder with the chosen display options", async () => {
    renderAt("/new/dictionary");

    await userEvent.click(await screen.findByRole("radio", { name: /Dark/ }));
    await userEvent.click(screen.getByRole("button", { name: "Create embed link" }));

    const editLink = await screen.findByLabelText("Embed link (can edit)");
    expect(editLink).toHaveValue(`${window.location.origin}/w/new1?theme=dark#key=k1`);
    expect(screen.getByLabelText("Read-only link")).toHaveValue(
      `${window.location.origin}/w/new1?theme=dark`
    );
    expect(localStorage.getItem("notion-widgets:edit-key:new1")).toBe("k1");

    const post = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({ type: "dictionary" });
  });

  it("shows a not-found message for unknown builder types", async () => {
    renderAt("/new/not-a-widget");
    expect(await screen.findByText(/no widget with that name/)).toBeInTheDocument();
  });
});

describe("link helpers", () => {
  it("sets the config without dropping other params", () => {
    const next = withConfig(new URLSearchParams("theme=dark&bg=transparent&c=old"), { a: 1 });
    expect(next.get("theme")).toBe("dark");
    expect(next.get("bg")).toBe("transparent");
    expect(decodeConfig(next)).toEqual({ a: 1 });
  });

  it("builds saved widget paths with display params and the key in the fragment", () => {
    const display = new URLSearchParams("theme=light");
    expect(savedWidgetPath("a b", "k/1", display)).toBe("/w/a%20b?theme=light#key=k%2F1");
    expect(savedWidgetPath("abc", undefined, new URLSearchParams())).toBe("/w/abc");
  });
});
