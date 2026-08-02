import type { RgoClientTableColumn } from "@/components/data-display/RgoClientTable/RgoClientTable";
import { AccountCircle, Email, Phone, Work } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";

// Sample data types
export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  department: string;
};

// Sample data
export const sampleUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    role: "Developer",
    status: "active",
    joinDate: "2023-01-15",
    department: "Engineering",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 234-5678",
    role: "Designer",
    status: "active",
    joinDate: "2023-03-20",
    department: "Design",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone: "+1 (555) 345-6789",
    role: "Manager",
    status: "inactive",
    joinDate: "2022-11-10",
    department: "Operations",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice.brown@example.com",
    phone: "+1 (555) 456-7890",
    role: "Analyst",
    status: "pending",
    joinDate: "2023-06-05",
    department: "Analytics",
  },
  {
    id: 5,
    name: "Charlie Wilson",
    email: "charlie.wilson@example.com",
    phone: "+1 (555) 567-8901",
    role: "Developer",
    status: "active",
    joinDate: "2023-02-28",
    department: "Engineering",
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

export const NameBody = ({ element }: { element: User; index: number }) => (
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

export const EmailBody = ({ element }: { element: User; index: number }) => (
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

export const PhoneBody = ({ element }: { element: User; index: number }) => (
  <Typography variant="body2">{element.phone}</Typography>
);

export const RoleHeader = () => (
  <Box display="flex" alignItems="center" gap={1}>
    <Work fontSize="small" />
    <Typography variant="subtitle2" fontWeight={600}>
      Role
    </Typography>
  </Box>
);

export const RoleBody = ({ element }: { element: User; index: number }) => (
  <Typography variant="body2">{element.role}</Typography>
);

export const StatusHeader = () => (
  <Typography variant="subtitle2" fontWeight={600}>
    Status
  </Typography>
);

export const StatusBody = ({ element }: { element: User; index: number }) => (
  <Typography
    variant="body2"
    color={element.status === "active" ? "success.main" : element.status === "inactive" ? "error.main" : "warning.main"}
  >
    {element.status}
  </Typography>
);

export const DepartmentHeader = () => (
  <Typography variant="subtitle2" fontWeight={600}>
    Department
  </Typography>
);

export const DepartmentBody = ({ element }: { element: User; index: number }) => (
  <Typography variant="body2">{element.department}</Typography>
);

// Accordion component for expandable rows
export const UserDetailsAccordion = ({ element }: { element: User }) => (
  <Box p={2} bgcolor="grey.50">
    <Typography variant="h6" gutterBottom>
      User Details
    </Typography>
    <Stack spacing={1}>
      <Typography variant="body2">
        <strong>User ID:</strong> {element.id}
      </Typography>
      <Typography variant="body2">
        <strong>Join Date:</strong> {new Date(element.joinDate).toLocaleDateString()}
      </Typography>
      <Typography variant="body2">
        <strong>Full Contact:</strong> {element.email} | {element.phone}
      </Typography>
    </Stack>
  </Box>
);

export const USER_KEY_MAPPER = (user: User) => user.id.toString();

// Base columns configuration
export const baseColumns: RgoClientTableColumn<User>[] = [
  {
    id: "name",
    HeaderComponent: NameHeader,
    BodyComponent: NameBody,
    align: "left",
    sort: (a, b) => a.name.localeCompare(b.name),
    widthPctShare: 16.6667,
    widthPxMin: 150,
    sticky: "left",
  },
  {
    id: "email",
    HeaderComponent: EmailHeader,
    BodyComponent: EmailBody,
    align: "left",
    sort: (a, b) => a.email.localeCompare(b.email),
    widthPctShare: 16.6667,
    widthPxMin: 150,
  },
];

// Extended columns configuration
export const extendedColumns: RgoClientTableColumn<User>[] = [
  ...baseColumns,
  {
    id: "phone",
    HeaderComponent: PhoneHeader,
    BodyComponent: PhoneBody,
    align: "left",
    widthPctShare: 16.6667,
    widthPxMin: 150,
  },
  {
    id: "role",
    HeaderComponent: RoleHeader,
    BodyComponent: RoleBody,
    align: "left",
    sort: (a, b) => a.role.localeCompare(b.role),
    widthPctShare: 16.6667,
    widthPxMin: 150,
  },
  {
    id: "status",
    HeaderComponent: StatusHeader,
    BodyComponent: StatusBody,
    align: "center",
    sort: (a, b) => a.status.localeCompare(b.status),
    widthPctShare: 16.6667,
    widthPxMin: 150,
  },
  {
    id: "department",
    HeaderComponent: DepartmentHeader,
    BodyComponent: DepartmentBody,
    align: "left",
    sort: (a, b) => a.department.localeCompare(b.department),
    widthPctShare: 16.6667,
    widthPxMin: 150,
  },
];
