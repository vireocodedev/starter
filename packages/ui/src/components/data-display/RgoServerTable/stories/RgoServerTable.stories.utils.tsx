import type { RgoServerTableColumn } from "@/components/data-display/RgoServerTable/RgoServerTable";
import type { PageableParams } from "@/utils/apiutils";
import { AccountCircle, Business, Email, Phone, Work } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";

// Sample data types
export type Employee = {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: "active" | "inactive" | "on-leave";
  department: string;
  salary: number;
  hireDate: string;
};

// Sample data
export const sampleEmployees: Employee[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    position: "Senior Developer",
    status: "active",
    department: "Engineering",
    salary: 95000,
    hireDate: "2022-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    phone: "+1 (555) 234-5678",
    position: "UX Designer",
    status: "active",
    department: "Design",
    salary: 78000,
    hireDate: "2022-03-20",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob.johnson@company.com",
    phone: "+1 (555) 345-6789",
    position: "Engineering Manager",
    status: "on-leave",
    department: "Engineering",
    salary: 125000,
    hireDate: "2021-11-10",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice.brown@company.com",
    phone: "+1 (555) 456-7890",
    position: "Data Analyst",
    status: "active",
    department: "Analytics",
    salary: 72000,
    hireDate: "2023-02-14",
  },
  {
    id: 5,
    name: "Charlie Wilson",
    email: "charlie.wilson@company.com",
    phone: "+1 (555) 567-8901",
    position: "Frontend Developer",
    status: "inactive",
    department: "Engineering",
    salary: 88000,
    hireDate: "2022-08-03",
  },
  {
    id: 6,
    name: "Diana Martinez",
    email: "diana.martinez@company.com",
    phone: "+1 (555) 678-9012",
    position: "Product Manager",
    status: "active",
    department: "Product",
    salary: 110000,
    hireDate: "2021-05-22",
  },
  {
    id: 7,
    name: "Eva Thompson",
    email: "eva.thompson@company.com",
    phone: "+1 (555) 789-0123",
    position: "DevOps Engineer",
    status: "active",
    department: "Engineering",
    salary: 92000,
    hireDate: "2022-12-01",
  },
  {
    id: 8,
    name: "Frank Garcia",
    email: "frank.garcia@company.com",
    phone: "+1 (555) 890-1234",
    position: "QA Engineer",
    status: "active",
    department: "Quality Assurance",
    salary: 75000,
    hireDate: "2023-01-30",
  },
];

// Component definitions for table columns
export const NameHeader = () => (
  <Box display="flex" alignItems="center" gap={1}>
    <AccountCircle fontSize="small" />
    <Typography variant="subtitle2" fontWeight={600}>
      Name
    </Typography>
  </Box>
);

export const NameBody = ({ element }: { element: Employee; index: number }) => (
  <Typography variant="body2" fontWeight={500}>
    {element.name}
  </Typography>
);

export const EmailHeader = () => (
  <Box display="flex" alignItems="center" gap={1}>
    <Email fontSize="small" />
    <Typography variant="subtitle2" fontWeight={600}>
      Email
    </Typography>
  </Box>
);

export const EmailBody = ({ element }: { element: Employee; index: number }) => (
  <Typography variant="body2" color="text.secondary">
    {element.email}
  </Typography>
);

export const PhoneHeader = () => (
  <Box display="flex" alignItems="center" gap={1}>
    <Phone fontSize="small" />
    <Typography variant="subtitle2" fontWeight={600}>
      Phone
    </Typography>
  </Box>
);

export const PhoneBody = ({ element }: { element: Employee; index: number }) => (
  <Typography variant="body2">{element.phone}</Typography>
);

export const PositionHeader = () => (
  <Box display="flex" alignItems="center" gap={1}>
    <Work fontSize="small" />
    <Typography variant="subtitle2" fontWeight={600}>
      Position
    </Typography>
  </Box>
);

export const PositionBody = ({ element }: { element: Employee; index: number }) => (
  <Typography variant="body2">{element.position}</Typography>
);

export const StatusHeader = () => (
  <Typography variant="subtitle2" fontWeight={600}>
    Status
  </Typography>
);

export const StatusBody = ({ element }: { element: Employee; index: number }) => (
  <Typography
    variant="body2"
    color={element.status === "active" ? "success.main" : element.status === "inactive" ? "error.main" : "warning.main"}
  >
    {element.status}
  </Typography>
);

export const DepartmentHeader = () => (
  <Box display="flex" alignItems="center" gap={1}>
    <Business fontSize="small" />
    <Typography variant="subtitle2" fontWeight={600}>
      Department
    </Typography>
  </Box>
);

export const DepartmentBody = ({ element }: { element: Employee; index: number }) => (
  <Typography variant="body2">{element.department}</Typography>
);

export const SalaryHeader = () => (
  <Typography variant="subtitle2" fontWeight={600}>
    Salary
  </Typography>
);

export const SalaryBody = ({ element }: { element: Employee; index: number }) => (
  <Typography variant="body2" fontWeight={500}>
    ${element.salary.toLocaleString()}
  </Typography>
);

// Accordion component for expandable rows
export const EmployeeDetailsAccordion = ({ element }: { element: Employee }) => (
  <Box p={2} bgcolor="grey.50">
    <Typography variant="h6" gutterBottom>
      Employee Details
    </Typography>
    <Stack spacing={1}>
      <Typography variant="body2">
        <strong>Employee ID:</strong> {element.id}
      </Typography>
      <Typography variant="body2">
        <strong>Hire Date:</strong> {new Date(element.hireDate).toLocaleDateString()}
      </Typography>
      <Typography variant="body2">
        <strong>Full Contact:</strong> {element.email} | {element.phone}
      </Typography>
      <Typography variant="body2">
        <strong>Annual Salary:</strong> ${element.salary.toLocaleString()}
      </Typography>
    </Stack>
  </Box>
);

// Base columns configuration (minimal required columns)
export const baseColumns: RgoServerTableColumn<Employee>[] = [
  {
    id: "name",
    HeaderComponent: NameHeader,
    BodyComponent: NameBody,
    align: "left",
    sort: "name",
    widthPctShare: 14.285,
    widthPxMin: 150,
  },
  {
    id: "email",
    HeaderComponent: EmailHeader,
    BodyComponent: EmailBody,
    align: "left",
    sort: "email",
    widthPctShare: 14.285,
    widthPxMin: 150,
  },
];

// Extended columns configuration
export const extendedColumns: RgoServerTableColumn<Employee>[] = [
  ...baseColumns,
  {
    id: "phone",
    HeaderComponent: PhoneHeader,
    BodyComponent: PhoneBody,
    align: "left",
    widthPctShare: 14.285,
    widthPxMin: 150,
  },
  {
    id: "position",
    HeaderComponent: PositionHeader,
    BodyComponent: PositionBody,
    align: "left",
    sort: "position",
    widthPctShare: 14.285,
    widthPxMin: 150,
  },
  {
    id: "status",
    HeaderComponent: StatusHeader,
    BodyComponent: StatusBody,
    align: "center",
    sort: "status",
    widthPctShare: 14.285,
    widthPxMin: 150,
  },
  {
    id: "department",
    HeaderComponent: DepartmentHeader,
    BodyComponent: DepartmentBody,
    align: "left",
    sort: "department",
    widthPctShare: 14.285,
    widthPxMin: 150,
  },
  {
    id: "salary",
    HeaderComponent: SalaryHeader,
    BodyComponent: SalaryBody,
    align: "right",
    sort: "salary",
    widthPctShare: 14.285,
    widthPxMin: 150,
  },
];

// Default pagination configuration
export const defaultPagination: PageableParams = {
  page: 0,
  rowsPerPage: 5,
  sortBy: "",
  sortDirection: "asc",
};
