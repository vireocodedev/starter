import { resetVireoLocaleWarningsForTests } from "@/integrations/localization/utils/localeResolver";
import { DateField } from "@mui/x-date-pickers/DateField";
import { LocalizationProvider, MuiPickersAdapterContext } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import "dayjs/locale/me";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VireoTemporalLocalizationProvider } from "./VireoTemporalLocalizationProvider";

function AdapterState({ testId }: { testId: string }) {
  const context = React.useContext(MuiPickersAdapterContext);
  return (
    <output
      data-format={context?.utils?.formats.keyboardDate}
      data-locale={context?.utils?.getCurrentLocaleCode()}
      data-text={context?.localeText?.clearButtonLabel}
      data-testid={testId}
    />
  );
}

describe("VireoTemporalLocalizationProvider", () => {
  beforeEach(() => resetVireoLocaleWarningsForTests());

  it("renders children synchronously", () => {
    render(
      <VireoTemporalLocalizationProvider locale="en">
        <span>Ready immediately</span>
      </VireoTemporalLocalizationProvider>,
    );

    expect(screen.getByText("Ready immediately")).toBeInTheDocument();
  });

  it.each([
    ["hr", "hr"],
    ["hr-HR", "hr"],
  ])("resolves the %s locale to registered Day.js locale %s", (locale, expected) => {
    render(
      <VireoTemporalLocalizationProvider locale={locale}>
        <AdapterState testId="adapter" />
      </VireoTemporalLocalizationProvider>,
    );

    expect(screen.getByTestId("adapter")).toHaveAttribute("data-locale", expected);
  });

  it("gives adapterLocale precedence over the semantic locale", () => {
    render(
      <VireoTemporalLocalizationProvider locale="cnr" adapterLocale="me">
        <AdapterState testId="adapter" />
      </VireoTemporalLocalizationProvider>,
    );

    expect(screen.getByTestId("adapter")).toHaveAttribute("data-locale", "me");
  });

  it("falls back to English and warns once for an unavailable locale", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <VireoTemporalLocalizationProvider locale="zz-ZZ">
        <AdapterState testId="first" />
      </VireoTemporalLocalizationProvider>,
    );
    render(
      <VireoTemporalLocalizationProvider locale="zz-ZZ">
        <AdapterState testId="second" />
      </VireoTemporalLocalizationProvider>,
    );

    expect(screen.getByTestId("first")).toHaveAttribute("data-locale", "en");
    expect(screen.getByTestId("second")).toHaveAttribute("data-locale", "en");
    expect(warning).toHaveBeenCalledOnce();
    warning.mockRestore();
  });

  it("does not mutate the global Day.js locale", () => {
    const initialLocale = dayjs.locale();
    render(
      <VireoTemporalLocalizationProvider locale="hr">
        <AdapterState testId="adapter" />
      </VireoTemporalLocalizationProvider>,
    );

    expect(dayjs.locale()).toBe(initialLocale);
  });

  it("keeps nested provider scopes independent", () => {
    render(
      <VireoTemporalLocalizationProvider locale="en">
        <AdapterState testId="outer" />
        <VireoTemporalLocalizationProvider locale="hr">
          <AdapterState testId="inner" />
        </VireoTemporalLocalizationProvider>
      </VireoTemporalLocalizationProvider>,
    );

    expect(screen.getByTestId("outer")).toHaveAttribute("data-locale", "en");
    expect(screen.getByTestId("inner")).toHaveAttribute("data-locale", "hr");
  });

  it("updates locale without remounting children", () => {
    let mounts = 0;
    function PersistentChild() {
      const [instance] = React.useState(() => {
        mounts += 1;
        return mounts;
      });
      const context = React.useContext(MuiPickersAdapterContext);
      return <output data-testid="child">{`${instance}:${context?.utils?.getCurrentLocaleCode()}`}</output>;
    }

    const { rerender } = render(
      <VireoTemporalLocalizationProvider locale="en">
        <PersistentChild />
      </VireoTemporalLocalizationProvider>,
    );
    rerender(
      <VireoTemporalLocalizationProvider locale="hr">
        <PersistentChild />
      </VireoTemporalLocalizationProvider>,
    );

    expect(screen.getByTestId("child")).toHaveTextContent("1:hr");
    expect(mounts).toBe(1);
  });

  it("merges custom formats and locale text over the bundled locale", () => {
    render(
      <VireoTemporalLocalizationProvider
        locale="hr"
        dateFormats={{ keyboardDate: "YYYY/MM/DD" }}
        localeText={{ clearButtonLabel: "Remove value" }}
      >
        <AdapterState testId="adapter" />
      </VireoTemporalLocalizationProvider>,
    );

    expect(screen.getByTestId("adapter")).toHaveAttribute("data-format", "YYYY/MM/DD");
    expect(screen.getByTestId("adapter")).toHaveAttribute("data-text", "Remove value");
  });

  it("uses Croatian picker text for Croatian regional locales", () => {
    render(
      <VireoTemporalLocalizationProvider locale="hr-HR">
        <DateField label="Datum" value={null} />
      </VireoTemporalLocalizationProvider>,
    );

    expect(screen.getByRole("textbox", { name: "Datum" })).toHaveAttribute("placeholder", "DD.MM.GGGG");
  });

  it("does not treat a native MUI provider as a Vireo provider", () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AdapterState testId="native" />
      </LocalizationProvider>,
    );
    expect(screen.getByTestId("native")).toHaveAttribute("data-locale", "en");
  });
});
