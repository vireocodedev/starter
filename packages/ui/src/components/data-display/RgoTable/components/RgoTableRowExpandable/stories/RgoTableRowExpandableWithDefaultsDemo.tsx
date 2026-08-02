import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoTableRowExpandable } from "@/components/data-display/RgoTable/components/RgoTableRowExpandable/RgoTableRowExpandable";
import {
  USER_COLUMNS,
  USER_DATA,
  UserAccordionComponent,
} from "@/components/data-display/RgoTable/components/RgoTableRowExpandable/stories/RgoTableRowExpandable.stories.utils";
import { Table, TableBody, TableContainer } from "@mui/material";

export function RgoTableRowExpandableWithDefaultsDemo() {
  return (
    <RgoLabelBox label="Single Expandable Row">
      <TableContainer>
        <Table>
          <TableBody>
            <RgoTableRowExpandable
              item={USER_DATA[0]}
              AccordionComponent={UserAccordionComponent}
              columns={USER_COLUMNS}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </RgoLabelBox>
  );
}

export const RgoTableRowExpandableWithDefaultsDemoCode = `
import { RgoLabelBox, RgoTableRowExpandable } from "@vireocodedev/starter-ui";
import { Box, Table, TableBody, TableContainer, Typography } from "@mui/material";

// const ACCORDION_COMPONENT = ...

export function RgoTableRowExpandableWithDefaultsDemo() {
  // const item = ...
  // const columns = ...

  return (
    <RgoLabelBox label="Single Expandable Row">
      <TableContainer>
        <Table>
          <TableBody>
            <RgoTableRowExpandable
              item={item}
              AccordionComponent={ACCORDION_COMPONENT}
              columns={columns}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </RgoLabelBox>
  );
}`;
