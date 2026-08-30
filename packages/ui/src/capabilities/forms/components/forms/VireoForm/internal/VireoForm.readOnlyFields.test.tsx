import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import React from "react";
import { describe, expect, it } from "vitest";

dayjs.extend(utc);

const VIREO_TEMPORAL_ADAPTER_MARKER = Symbol.for("@vireocodedev/ui/VireoTemporalLocalizationProvider");

class VireoTestAdapterDayjs extends AdapterDayjs {
  readonly [VIREO_TEMPORAL_ADAPTER_MARKER] = true;
}

const option = { label: "Alpha", value: "alpha" };
const options = [option];

function ReadOnlyFieldFamily() {
  const form = useVireoForm({
    defaultValues: {
      autocomplete: "alpha" as string | null,
      autocompleteMultiple: ["alpha"],
      checkbox: true,
      counter: 2 as number | null,
      file: new File(["x"], "single.pdf", { type: "application/pdf" }) as File | null,
      fileList: [] as File[],
      freeSolo: "Custom value" as string | null,
      freeSoloMultiple: ["First custom", "Second custom"],
      number: 0 as number | null,
      radio: "alpha" as string | null,
      select: "alpha" as string | null,
      selectMultiple: ["alpha"],
      switch: false,
      temporal: "2026-08-29" as string | null,
      text: "",
      toggle: "alpha" as string | null,
    },
    onSubmit: () => undefined,
  });

  return (
    <LocalizationProvider dateAdapter={VireoTestAdapterDayjs} adapterLocale="en">
      <form.Form readOnly readOnlyEmptyValue="Missing">
        <form.Field name="autocomplete">
          {field => (
            <field.AutocompleteField
              label="Autocomplete"
              options={options}
              getOptionLabel={item => `Autocomplete ${item.label}`}
              getOptionValue={item => item.value}
            />
          )}
        </form.Field>
        <form.Field name="autocompleteMultiple">
          {field => (
            <field.AutocompleteMultipleField
              label="Autocomplete multiple"
              options={options}
              getOptionLabel={item => `Autocomplete multiple ${item.label}`}
              getOptionValue={item => item.value}
            />
          )}
        </form.Field>
        <form.Field name="checkbox">{field => <field.CheckboxField label="Checkbox" />}</form.Field>
        <form.Field name="counter">{field => <field.CounterField aria-label="Counter" />}</form.Field>
        <form.Field name="file">{field => <field.FileField />}</form.Field>
        <form.Field name="fileList">{field => <field.FileListField />}</form.Field>
        <form.Field name="freeSolo">
          {field => (
            <field.FreeSoloAutocompleteField
              label="Free solo"
              options={options}
              getOptionLabel={item => item.label}
              getOptionValue={item => item.value}
            />
          )}
        </form.Field>
        <form.Field name="freeSoloMultiple">
          {field => (
            <field.FreeSoloAutocompleteMultipleField
              label="Free solo multiple"
              options={options}
              getOptionLabel={item => item.label}
              getOptionValue={item => item.value}
            />
          )}
        </form.Field>
        <form.Field name="number">{field => <field.NumberField label="Number" />}</form.Field>
        <form.Field name="radio">
          {field => (
            <field.RadioGroupField
              aria-label="Radio"
              options={options}
              getOptionValue={item => item.value}
              renderOption={item => `Radio ${item.label}`}
            />
          )}
        </form.Field>
        <form.Field name="select">
          {field => (
            <field.SelectField
              label="Select"
              options={options}
              getOptionValue={item => item.value}
              renderOption={item => `Select ${item.label}`}
            />
          )}
        </form.Field>
        <form.Field name="selectMultiple">
          {field => (
            <field.SelectMultipleField
              label="Select multiple"
              options={options}
              getOptionValue={item => item.value}
              renderOption={item => `Select multiple ${item.label}`}
            />
          )}
        </form.Field>
        <form.Field name="switch">{field => <field.SwitchField label="Switch" />}</form.Field>
        <form.Field name="temporal">
          {field => <field.TemporalField mode="date" slotProps={{ htmlInput: { "aria-label": "Temporal" } }} />}
        </form.Field>
        <form.Field name="text">{field => <field.TextField label="Text" />}</form.Field>
        <form.Field name="toggle">
          {field => <field.ToggleButtonGroupField aria-label="Toggle" options={options} />}
        </form.Field>
        <form.SubmitButton>Save</form.SubmitButton>
      </form.Form>
    </LocalizationProvider>
  );
}

describe("VireoForm read-only field family", () => {
  it("renders every bound field as a display value and omits editable controls", () => {
    render(<ReadOnlyFieldFamily />);

    expect(screen.getByText("Autocomplete Alpha")).toBeInTheDocument();
    expect(screen.getByText("Autocomplete multiple Alpha")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/single\.pdf/)).toBeInTheDocument();
    expect(screen.getAllByText("Missing")).toHaveLength(2);
    expect(screen.getByText("Custom value")).toBeInTheDocument();
    expect(screen.getByText("First custom, Second custom")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Radio Alpha")).toBeInTheDocument();
    expect(screen.getByText("Select Alpha")).toBeInTheDocument();
    expect(screen.getByText("Select multiple Alpha")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("2026-08-29")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });
});
