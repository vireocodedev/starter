import { InputAutocomplete } from "@/inputs/InputAutocomplete";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

type Option = { id: number; label: string };

const OPTIONS: Option[] = [
  { id: 1, label: "Alpha" },
  { id: 2, label: "Beta" },
];

function Harness({
  resolve,
  inputProps,
}: {
  resolve: (searchText: string) => Promise<Option[]>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const [value, setValue] = React.useState<Option | null>(null);

  return (
    <InputAutocomplete<Option>
      value={value}
      onChange={setValue}
      options={async searchText => await resolve(searchText)}
      getOptionLabel={option => option.label}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      searchMinLength={0}
      slotProps={inputProps ? { textField: { inputProps } } : undefined}
    />
  );
}

function openDropdown() {
  fireEvent.click(screen.getByRole("button", { name: /open/i }));
}

describe("InputAutocomplete", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("forwards the field name and ref to its focusable input", () => {
    const inputRef = React.createRef<HTMLInputElement>();

    render(
      <InputAutocomplete<Option>
        name="buyerId"
        inputRef={inputRef}
        value={null}
        onChange={() => undefined}
        options={OPTIONS}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(option, selected) => option.id === selected.id}
        mobilePicker={{
          enabled: true,
          title: "Select buyer",
          closeLabel: "Back",
          clearSearchLabel: "Clear",
          searchLabel: "Search buyers",
          noOptionsLabel: "No buyers",
        }}
      />,
    );

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("name", "buyerId");
    expect(inputRef.current).toBe(input);
  });

  it("keeps the input wired up when the caller supplies its own inputProps", async () => {
    // Caller `inputProps` used to replace MUI's own bag, dropping the input ref. Opening the dropdown
    // then threw ("Cannot read properties of null (reading 'focus')") and the nearest error boundary
    // tore down the whole page, closing whatever dialog the field lived in.
    render(<Harness resolve={async () => OPTIONS} inputProps={{ enterKeyHint: "next" }} />);

    expect(screen.getByRole("combobox")).toHaveAttribute("enterkeyhint", "next");

    openDropdown();

    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("renders no matches instead of throwing when the option resolver rejects", async () => {
    const resolve = vi.fn(async () => {
      throw new Error("network down");
    });

    render(<Harness resolve={resolve} />);
    openDropdown();

    await waitFor(() => expect(resolve).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("No options")).toBeInTheDocument());
  });

  it("selects from the mobile picker and closes it", async () => {
    function MobileHarness() {
      const [value, setValue] = React.useState<Option | null>(null);

      return (
        <InputAutocomplete<Option>
          value={value}
          onChange={setValue}
          options={OPTIONS}
          getOptionLabel={option => option.label}
          isOptionEqualToValue={(option, selected) => option.id === selected.id}
          mobilePicker={{
            enabled: true,
            title: "Select buyer",
            closeLabel: "Back",
            clearSearchLabel: "Clear",
            searchLabel: "Search buyers",
            noOptionsLabel: "No buyers",
          }}
        />
      );
    }

    render(<MobileHarness />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Alpha" }));

    expect(trigger).toHaveValue("Alpha");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("loads additional mobile pages when the sentinel enters the viewport", async () => {
    let intersectionCallback: IntersectionObserverCallback | undefined;
    class TestIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }
      disconnect = vi.fn();
      observe = vi.fn();
      takeRecords = vi.fn(() => []);
      unobserve = vi.fn();
    }
    vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
    const loadPage = vi.fn(async (_searchText: string, page: number) =>
      page === 0 ? { options: [OPTIONS[0]], hasMore: true } : { options: [OPTIONS[1]], hasMore: false },
    );

    render(
      <InputAutocomplete<Option>
        value={null}
        onChange={() => undefined}
        options={OPTIONS}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(option, selected) => option.id === selected.id}
        mobilePicker={{
          enabled: true,
          open: true,
          hideTrigger: true,
          title: "Select buyer",
          closeLabel: "Back",
          clearSearchLabel: "Clear",
          searchLabel: "Search buyers",
          noOptionsLabel: "No buyers",
          loadPage,
        }}
      />,
    );

    await screen.findByRole("option", { name: "Alpha" });
    await waitFor(() => expect(intersectionCallback).toBeDefined());
    act(() => {
      intersectionCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    await screen.findByRole("option", { name: "Beta" });
    expect(loadPage).toHaveBeenNthCalledWith(1, "", 0);
    expect(loadPage).toHaveBeenNthCalledWith(2, "", 1);
  });

  it("sorts options by label while respecting disabled options", async () => {
    render(
      <InputAutocomplete<Option>
        value={null}
        onChange={() => undefined}
        options={[OPTIONS[1], OPTIONS[0]]}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(option, selected) => option.id === selected.id}
        getOptionDisabled={option => option.id === 2}
      />,
    );

    openDropdown();
    const options = await screen.findAllByRole("option");
    expect(options.map(option => option.textContent)).toEqual(["Alpha", "Beta"]);
    expect(screen.getByRole("option", { name: "Beta" })).toHaveAttribute("aria-disabled", "true");
  });
});
