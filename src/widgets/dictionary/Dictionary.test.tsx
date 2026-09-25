import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dictionary from "./Dictionary";
import DictionaryInitContextProvider from "./DictionaryInitContextProvider";

function renderDictionary(search: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[`/dictionary?${search}`]}>
        <DictionaryInitContextProvider>
          <Dictionary />
        </DictionaryInitContextProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Dictionary", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: () => Promise.resolve([[["x"]]]) })
    );
  });

  it("removes the clicked row, not the last one", async () => {
    renderDictionary(
      "from=fr&to=en&text=eau&from=fr&to=en&text=pain&from=fr&to=en&text=vin"
    );

    const rows = screen.getAllByDisplayValue(/^(eau|pain|vin)$/);
    expect(rows.map((input) => (input as HTMLInputElement).value)).toEqual([
      "eau",
      "pain",
      "vin",
    ]);

    const painRow = rows[1].closest(".MuiGrid-container") as HTMLElement;
    await userEvent.click(within(painRow).getByTestId("CloseIcon"));

    const remaining = screen
      .getAllByDisplayValue(/^(eau|pain|vin)$/)
      .map((input) => (input as HTMLInputElement).value);
    expect(remaining).toEqual(["eau", "vin"]);
  });
});
