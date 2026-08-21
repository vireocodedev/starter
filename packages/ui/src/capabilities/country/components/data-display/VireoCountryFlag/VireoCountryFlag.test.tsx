import { COUNTRY_CODES } from "@/capabilities/country/constants/countryCodes.constants";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VireoCountryFlag } from "./VireoCountryFlag";
import { vireoCountryFlagClasses } from "./VireoCountryFlag.classes";
import { VIREO_COUNTRY_FLAG_NAME } from "./VireoCountryFlag.identity";

describe(VIREO_COUNTRY_FLAG_NAME, () => {
  it("renders a known flag decoratively with only the required country code", () => {
    const { container } = render(<VireoCountryFlag countryCode="HR" />);
    const root = container.querySelector("span");

    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass(vireoCountryFlagClasses.root, vireoCountryFlagClasses.known);
    expect(root?.querySelector("svg")).toHaveClass(vireoCountryFlagClasses.flag);
  });

  it("resolves every upstream registry identifier to a real flag component", () => {
    const { container } = render(
      <>
        {COUNTRY_CODES.map(countryCode => (
          <VireoCountryFlag key={countryCode} countryCode={countryCode} />
        ))}
      </>,
    );

    expect(container.querySelectorAll(`.${vireoCountryFlagClasses.known}`)).toHaveLength(COUNTRY_CODES.length);
    expect(container.querySelectorAll(`.${vireoCountryFlagClasses.unknown}`)).toHaveLength(0);
  });

  it("resolves hyphenated subdivision identifiers", () => {
    const { container } = render(<VireoCountryFlag countryCode="BQ-BO" label="Bonaire" />);

    expect(container.querySelector(`.${vireoCountryFlagClasses.known}`)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Bonaire" })).toBeInTheDocument();
  });

  it("renders the themed fallback for unknown and empty codes", () => {
    const { container } = render(
      <>
        <VireoCountryFlag countryCode="ZZ" />
        <VireoCountryFlag countryCode="" />
      </>,
    );

    expect(container.querySelectorAll(`.${vireoCountryFlagClasses.unknown}`)).toHaveLength(2);
    expect(screen.getAllByText("?")).toHaveLength(2);
  });

  it("uses an explicit label as its accessible name", () => {
    render(<VireoCountryFlag countryCode="JP" label="Japan office" />);

    expect(screen.getByRole("img", { name: "Japan office" })).toBeInTheDocument();
  });

  it("derives an English accessible tooltip name when no label is supplied", async () => {
    render(<VireoCountryFlag countryCode="JP" enableTooltip />);
    const flag = screen.getByRole("img", { name: "Japan" });

    fireEvent.mouseOver(flag);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Japan");
    expect(flag).toHaveClass(vireoCountryFlagClasses.tooltipEnabled);
  });

  it("uses explicit and unknown tooltip labels", async () => {
    const { rerender } = render(<VireoCountryFlag countryCode="GB-SCT" label="Scottish office" enableTooltip />);
    fireEvent.mouseOver(screen.getByRole("img", { name: "Scottish office" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Scottish office");

    rerender(<VireoCountryFlag countryCode="ZZ" enableTooltip />);
    fireEvent.mouseOver(screen.getByRole("img", { name: "Unknown country (ZZ)" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Unknown country (ZZ)");
  });

  it("applies the default and customized width while retaining a 3:2 surface", () => {
    const { container, rerender } = render(
      <VireoCountryFlag countryCode="DE" slotProps={{ root: ownerState => ({ "data-width": ownerState.width }) }} />,
    );
    expect(container.querySelector("span")).toHaveAttribute("data-width", "24");

    rerender(
      <VireoCountryFlag
        countryCode="DE"
        width="3rem"
        slotProps={{ root: ownerState => ({ "data-width": ownerState.width }) }}
      />,
    );
    expect(container.querySelector("span")).toHaveAttribute("data-width", "3rem");
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 24 16");
  });

  it("forwards refs and merges root customization", () => {
    const forwardedRef = React.createRef<HTMLSpanElement>();
    const rootSlotRef = React.createRef<HTMLSpanElement>();

    render(
      <VireoCountryFlag
        countryCode="HR"
        label="Croatia"
        ref={forwardedRef}
        className="direct-class"
        style={{ marginLeft: 10 }}
        slotProps={{
          root: {
            ref: rootSlotRef,
            className: "slot-class",
            "data-origin": "slot",
            style: { marginRight: 12 },
          },
        }}
      />,
    );

    const root = screen.getByRole("img", { name: "Croatia" });
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoCountryFlagClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ marginLeft: "10px", marginRight: "12px" });
  });

  it("supports replacement root and flag slots with owner-state slot props", () => {
    const CustomFlag = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
      <svg {...props} ref={ref} data-custom-flag="true" />
    ));

    render(
      <VireoCountryFlag
        countryCode="CUSTOM"
        label="Custom flag"
        slots={{ root: "section", flag: CustomFlag }}
        slotProps={{ root: ownerState => ({ "data-known": ownerState.known, "data-slot": "root" }) }}
      />,
    );

    const root = screen.getByRole("img", { name: "Custom flag" });
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveAttribute("data-known", "false");
    expect(root.querySelector("svg")).toHaveAttribute("data-custom-flag", "true");
  });

  it("protects component-owned accessibility and SVG geometry", () => {
    const { container } = render(
      <VireoCountryFlag
        countryCode="HR"
        label="Croatia"
        slotProps={{
          root: { "aria-hidden": true, "aria-label": "Wrong", role: "presentation" },
          flag: { "aria-hidden": false, focusable: "true", height: 1, viewBox: "0 0 1 1", width: 1 },
        }}
      />,
    );

    expect(screen.getByRole("img", { name: "Croatia" })).toBeInTheDocument();
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).toHaveAttribute("height", "16");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 16");
    expect(svg).toHaveAttribute("width", "24");
  });

  it("uses theme default props and slot/state style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_COUNTRY_FLAG_NAME]: {
          defaultProps: { label: "Theme label", width: 40 },
          styleOverrides: {
            flag: { opacity: 0.75 },
            known: { borderRadius: 6 },
            root: { color: "rgb(123, 45, 67)" },
          },
        },
      },
    });

    const { container } = render(
      <ThemeProvider theme={theme}>
        <VireoCountryFlag countryCode="IT" />
      </ThemeProvider>,
    );

    expect(screen.getByRole("img", { name: "Theme label" })).toHaveStyle({
      borderRadius: "6px",
      color: "rgb(123, 45, 67)",
      width: "40px",
    });
    expect(container.querySelector("svg")).toHaveStyle({ opacity: "0.75" });
  });

  it("renders known and unknown flags during server rendering", () => {
    expect(renderToString(<VireoCountryFlag countryCode="GB-SCT" label="Scotland" />)).toContain(
      'aria-label="Scotland"',
    );
    expect(renderToString(<VireoCountryFlag countryCode="ZZ" />)).toContain(">?</text>");
  });
});
