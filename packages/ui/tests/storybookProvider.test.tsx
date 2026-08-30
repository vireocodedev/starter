import { useTheme } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoStorybookProvider } from "../storybook/VireoStorybookProvider";

function ThemeProbe() {
  const theme = useTheme();
  return <output>{`${theme.palette.mode}:${theme.direction}:${theme.vireo.surface.canvas}`}</output>;
}

describe("VireoStorybookProvider", () => {
  it.each([
    ["light", "light:ltr:#f8fafc"],
    ["dark", "dark:ltr:#080d18"],
  ] as const)("renders the canonical %s review theme", (themeMode, expected) => {
    render(
      <VireoStorybookProvider themeMode={themeMode}>
        <ThemeProbe />
      </VireoStorybookProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent(expected);
  });

  it("lets nested executable examples inherit the selected outer review mode", () => {
    render(
      <VireoStorybookProvider themeMode="light">
        <VireoStorybookProvider>
          <ThemeProbe />
        </VireoStorybookProvider>
      </VireoStorybookProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("light:ltr:#f8fafc");
  });

  it("applies and inherits right-to-left review direction", () => {
    render(
      <VireoStorybookProvider themeDirection="rtl">
        <VireoStorybookProvider>
          <ThemeProbe />
        </VireoStorybookProvider>
      </VireoStorybookProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("dark:rtl:#080d18");
    expect(screen.getByRole("status").closest('[dir="rtl"]')).not.toBeNull();
  });
});
