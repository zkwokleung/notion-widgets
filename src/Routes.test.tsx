import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./api/queryClient";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "./Routes";
import { decodeConfig } from "./widgets/configCodec";

function renderAt(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  render(
    <QueryClientProvider client={createQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
}

const savedDoc = {
  id: "abc123",
  type: "dictionary",
  updatedAt: "2026-09-25T00:00:00.000Z",
  config: { words: [{ id: "w1", from: "fr", to: "en", text: "eau" }] },
};

describe("routes", () => {
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
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
  });

  it("shows saved widgets without a key as read-only", async () => {
    renderAt("/w/abc123");

    expect(await screen.findByDisplayValue("eau")).toBeInTheDocument();
    expect(screen.queryByText("Copy embed link")).not.toBeInTheDocument();
    expect(screen.queryByTestId("CloseIcon")).not.toBeInTheDocument();
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
});
