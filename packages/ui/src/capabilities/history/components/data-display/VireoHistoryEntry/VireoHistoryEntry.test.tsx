import { VireoHistoryEntry } from "./VireoHistoryEntry";
import { vireoHistoryEntryClasses } from "./VireoHistoryEntry.classes";
import { VIREO_HISTORY_ENTRY_NAME } from "./VireoHistoryEntry.identity";
import { ThemeProvider, createTheme } from "@mui/material";
import { createHistoryDefinition } from "@vireocodedev/starter-history";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { z } from "zod";

const ProfileSchema = z.object({ id: z.string(), name: z.string(), status: z.string(), owner: z.string() });
const profileHistoryDefinition = createHistoryDefinition(
  ProfileSchema,
  { label: "Profile", key: profile => profile.id, format: profile => profile.name },
  {
    id: false,
    name: { kind: "field", label: "Name" },
    status: { kind: "field", label: "Status" },
    owner: { kind: "field", label: "Owner" },
  },
);

const previousProfile = { id: "profile-1", name: "Northstar", status: "Prospect", owner: "Maya" };
const currentProfile = { id: "profile-1", name: "Northstar", status: "Active", owner: "Maya" };

const AddressSchema = z.object({ city: z.string(), country: z.string() });
const NestedProfileSchema = z.object({ id: z.string(), address: AddressSchema });
const addressHistoryDefinition = createHistoryDefinition(
  AddressSchema,
  { label: "Address", key: address => address.city },
  {
    city: { kind: "field", label: "City" },
    country: { kind: "field", label: "Country" },
  },
);
const nestedProfileHistoryDefinition = createHistoryDefinition(
  NestedProfileSchema,
  { label: "Profile", key: profile => profile.id },
  { id: false, address: { kind: "object", definition: addressHistoryDefinition } },
);

describe(VIREO_HISTORY_ENTRY_NAME, () => {
  it("renders a typed changed snapshot with only its required props", () => {
    render(
      <VireoHistoryEntry definition={profileHistoryDefinition} previous={previousProfile} current={currentProfile} />,
    );

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Prospect")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getAllByText("→").length).toBeGreaterThan(0);
    expect(screen.queryByText("Owner")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse section Profile" })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Updated" }).length).toBeGreaterThan(0);
  });

  it("shows unchanged fields on demand from the root group even without root metadata", () => {
    render(
      <VireoHistoryEntry definition={profileHistoryDefinition} previous={previousProfile} current={currentProfile} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show unchanged" }));

    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide unchanged" })).toBeInTheDocument();
  });

  it("supports added and removed snapshots", () => {
    const { rerender } = render(
      <VireoHistoryEntry definition={profileHistoryDefinition} previous={null} current={currentProfile} />,
    );

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(
      within(screen.getByRole("button", { name: "Collapse section Profile" })).getByRole("img", { name: "Added" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("→")).not.toBeInTheDocument();
    expect(screen.queryByText("—")).not.toBeInTheDocument();

    rerender(<VireoHistoryEntry definition={profileHistoryDefinition} previous={previousProfile} current={null} />);

    expect(screen.getByText("Prospect")).toHaveStyle({ textDecoration: "line-through" });
    expect(
      within(screen.getByRole("button", { name: "Collapse section Profile" })).getByRole("img", { name: "Removed" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("→")).not.toBeInTheDocument();
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });

  it("renders empty container changes without a dead disclosure control", () => {
    const schema = z.object({ id: z.string(), items: z.array(z.string()).nullable() });
    const definition = createHistoryDefinition(
      schema,
      { label: "List", key: list => list.id },
      {
        id: false,
        items: { kind: "array", label: "Items", item: { kind: "field", label: "Item" } },
      },
    );

    render(
      <VireoHistoryEntry
        definition={definition}
        previous={{ id: "list-1", items: null }}
        current={{ id: "list-1", items: [] }}
      />,
    );

    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("1 change")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Added" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /section Items/u })).not.toBeInTheDocument();
  });

  it.fails("renders consumer-provided content for an absent comparison value", () => {
    render(
      <VireoHistoryEntry
        definition={profileHistoryDefinition}
        previous={null}
        current={currentProfile}
        emptyValue="Not recorded"
      />,
    );

    expect(screen.getAllByText("Not recorded").length).toBeGreaterThan(0);
  });

  it("renders unchanged values once without comparison punctuation", () => {
    render(
      <VireoHistoryEntry
        definition={profileHistoryDefinition}
        previous={previousProfile}
        current={currentProfile}
        defaultShowUnchanged
      />,
    );

    const ownerRow = screen.getByRole("group", { name: "Owner: Unchanged" });
    expect(within(ownerRow).getByText("Maya")).toBeInTheDocument();
    expect(within(ownerRow).queryByText("→")).not.toBeInTheDocument();
    expect(within(ownerRow).queryByText("—")).not.toBeInTheDocument();
  });

  it("expands nested groups independently from the root", () => {
    render(
      <VireoHistoryEntry
        definition={nestedProfileHistoryDefinition}
        previous={{ id: "profile-1", address: { city: "Zagreb", country: "Croatia" } }}
        current={{ id: "profile-1", address: { city: "Samobor", country: "Croatia" } }}
        defaultExpandedDepth={1}
      />,
    );

    expect(screen.queryByText("Zagreb")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand section Address" }));
    expect(screen.getByText("Zagreb")).toBeInTheDocument();
    expect(screen.getByText("Samobor")).toBeInTheDocument();
  });

  it("keeps nested change counts stable when unchanged fields are shown", () => {
    render(
      <VireoHistoryEntry
        definition={nestedProfileHistoryDefinition}
        previous={{ id: "profile-1", address: { city: "Zagreb", country: "Croatia" } }}
        current={{ id: "profile-1", address: { city: "Samobor", country: "Croatia" } }}
        defaultExpandedDepth={2}
      />,
    );

    const addressSummary = screen.getByRole("button", { name: "Collapse section Address" });
    expect(within(addressSummary).getByText("1 change")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show unchanged" }));

    expect(screen.getByText("Country")).toBeInTheDocument();
    expect(within(addressSummary).getByText("1 change")).toBeInTheDocument();
    expect(within(addressSummary).queryByText("2 changes")).not.toBeInTheDocument();
  });

  it("preserves nested disclosure choices when the root closes and reopens", async () => {
    render(
      <VireoHistoryEntry
        definition={nestedProfileHistoryDefinition}
        previous={{ id: "profile-1", address: { city: "Zagreb", country: "Croatia" } }}
        current={{ id: "profile-1", address: { city: "Samobor", country: "Croatia" } }}
        defaultExpandedDepth={1}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand section Address" }));
    expect(screen.getByText("Zagreb")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Collapse section Profile" }));
    await waitFor(() => expect(screen.queryByText("Zagreb")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Expand section Profile" }));
    expect(await screen.findByText("Zagreb")).toBeInTheDocument();
  });

  it("hides the unchanged action while the root is collapsed", () => {
    render(
      <VireoHistoryEntry definition={profileHistoryDefinition} previous={previousProfile} current={currentProfile} />,
    );

    expect(screen.getByRole("button", { name: "Show unchanged" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Collapse section Profile" }));
    expect(screen.queryByRole("button", { name: "Show unchanged" })).not.toBeInTheDocument();
  });

  it("omits unchanged-only entries unless unchanged values are requested initially", () => {
    const { container, rerender } = render(
      <VireoHistoryEntry definition={profileHistoryDefinition} previous={previousProfile} current={previousProfile} />,
    );

    expect(container).toBeEmptyDOMElement();

    rerender(
      <VireoHistoryEntry
        definition={profileHistoryDefinition}
        previous={previousProfile}
        current={previousProfile}
        defaultShowUnchanged
      />,
    );
    expect(screen.getByText("Owner")).toBeInTheDocument();
  });

  it("uses consumer-provided interaction labels", () => {
    render(
      <VireoHistoryEntry
        definition={profileHistoryDefinition}
        previous={previousProfile}
        current={currentProfile}
        labels={{ showUnchanged: "Include unchanged values", hideUnchanged: "Exclude unchanged values" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Include unchanged values" }));
    expect(screen.getByRole("button", { name: "Exclude unchanged values" })).toBeInTheDocument();
  });

  it("forwards refs and composes root classes, props, and owner state", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();

    render(
      <VireoHistoryEntry
        ref={forwardedRef}
        definition={profileHistoryDefinition}
        previous={previousProfile}
        current={currentProfile}
        className="direct-class"
        slotProps={{
          root: ownerState => ({
            ref: rootSlotRef,
            className: "slot-class",
            "data-depth": ownerState.defaultExpandedDepth,
            "data-expanded": ownerState.expanded,
            "data-has-unchanged": ownerState.hasUnchanged,
          }),
        }}
      />,
    );

    expect(forwardedRef.current).toBe(rootSlotRef.current);
    expect(forwardedRef.current).toHaveClass(vireoHistoryEntryClasses.root, "direct-class", "slot-class");
    expect(forwardedRef.current).toHaveAttribute("data-depth", "3");
    expect(forwardedRef.current).toHaveAttribute("data-expanded", "true");
    expect(forwardedRef.current).toHaveAttribute("data-has-unchanged", "true");
  });

  it("supports a replacement root and MUI theme configuration", () => {
    const theme = createTheme({
      components: {
        [VIREO_HISTORY_ENTRY_NAME]: {
          defaultProps: { className: "theme-default" },
          styleOverrides: { root: { borderTop: "3px solid rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoHistoryEntry
          definition={profileHistoryDefinition}
          previous={previousProfile}
          current={currentProfile}
          slots={{ root: "section" }}
          slotProps={{ root: { "aria-label": "Profile history" } }}
        />
      </ThemeProvider>,
    );

    expect(screen.getByRole("region", { name: "Profile history" })).toHaveClass("theme-default");
    expect(screen.getByRole("region", { name: "Profile history" })).toHaveStyle({
      borderTop: "3px solid rgb(123, 45, 67)",
    });
  });
});
