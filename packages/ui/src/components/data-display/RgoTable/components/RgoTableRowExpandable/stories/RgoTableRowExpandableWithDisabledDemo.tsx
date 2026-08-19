import { RgoLabelBox } from "@/core/public";
import { RgoTableRowExpandable } from "@/components/data-display/RgoTable/components/RgoTableRowExpandable/RgoTableRowExpandable";
import {
  USER_COLUMNS,
  USER_DATA,
  UserAccordionComponent,
} from "@/components/data-display/RgoTable/components/RgoTableRowExpandable/stories/RgoTableRowExpandable.stories.utils";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

export function RgoTableRowExpandableWithDisabledDemo() {
  return (
    <RgoLabelBox label="With Disabled Rows">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              {USER_COLUMNS.map(column => (
                <TableCell key={column.id} align={column.align}>
                  <column.HeaderComponent />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {USER_DATA.map(user => (
              <RgoTableRowExpandable
                key={user.id}
                item={user}
                columns={USER_COLUMNS}
                AccordionComponent={UserAccordionComponent}
                disabled={user.name === "John Doe" || user.name === "Jane Smith"}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </RgoLabelBox>
  );
}

export const RgoTableRowExpandableWithDisabledDemoCode = `
import { RgoLabelBox, RgoTableRowExpandable } from "@vireocodedev/starter-ui";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

// const USER_ACCORDION_COMPONENT = ...
// const USER_COLUMNS = ...
// const USER_DATA = ...

export function RgoTableRowExpandableWithDisabledDemo() {
  return (
    <RgoLabelBox label="With Disabled Rows">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              {USER_COLUMNS.map(column => (
                <TableCell key={column.id} align={column.align}>
                  <column.HeaderComponent />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {USER_DATA.map(user => (
              <RgoTableRowExpandable
                key={user.id}
                item={user}
                columns={USER_COLUMNS}
                AccordionComponent={USER_ACCORDION_COMPONENT}
                disabled={user.name === "John Doe" || user.name === "Jane Smith"}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </RgoLabelBox>
  );
}`;
