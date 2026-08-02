import { type DtBaseColumn } from "@/components/data-display/RgoTable";
import { AccountCircle, Email, Info, Person, Phone, Work } from "@mui/icons-material";
import { Box, Chip, Stack, Typography } from "@mui/material";

export type User = {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  role: string;
  phone?: string;
  department?: string;
  joinDate?: string;
};

export const USER_DATA: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    status: "active",
    role: "Developer",
    phone: "+1 (555) 123-4567",
    department: "Engineering",
    joinDate: "2023-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "pending",
    role: "Designer",
    phone: "+1 (555) 987-6543",
    department: "Design",
    joinDate: "2023-03-22",
  },
  {
    id: 3,
    name: "Bob Wilson",
    email: "bob.wilson@example.com",
    status: "inactive",
    role: "Manager",
    department: "Operations",
    joinDate: "2022-11-08",
  },
];

const statusColors = { active: "success", pending: "warning", inactive: "error" } as const;

const Field = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <Box display="flex" alignItems="center" gap={2}>
    <Icon fontSize="small" color="action" />
    <Box>
      <Typography variant="body2" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {value}
      </Typography>
    </Box>
  </Box>
);

export const UserAccordionComponent = ({ element }: { element: User }) => (
  <Box sx={{ py: 2 }}>
    <Typography variant="h6" gutterBottom>
      User Details
    </Typography>
    <Stack spacing={2}>
      <Field icon={Phone} label="Phone" value={element.phone || "Not provided"} />
      <Field icon={Work} label="Department" value={element.department || "Not assigned"} />
      {element.joinDate && (
        <Field icon={Info} label="Join Date" value={new Date(element.joinDate).toLocaleDateString()} />
      )}
    </Stack>
  </Box>
);

export const USER_COLUMNS: DtBaseColumn<User>[] = [
  {
    id: "name",
    HeaderComponent: () => (
      <Box display="flex" alignItems="center" gap={1}>
        <Person fontSize="small" />
        <Typography variant="body2" fontWeight={600}>
          Name
        </Typography>
      </Box>
    ),
    BodyComponent: ({ element }: { element: User }) => (
      <Box display="flex" alignItems="center" gap={1}>
        <AccountCircle color="action" />
        <Typography variant="body2">{element.name}</Typography>
      </Box>
    ),
    align: "left",
    widthPctShare: 0,
    widthPxMin: 0,
  },
  {
    id: "email",
    HeaderComponent: () => (
      <Box display="flex" alignItems="center" gap={1}>
        <Email fontSize="small" />
        <Typography variant="body2" fontWeight={600}>
          Email
        </Typography>
      </Box>
    ),
    BodyComponent: ({ element }: { element: User }) => (
      <Typography variant="body2" color="text.secondary">
        {element.email}
      </Typography>
    ),
    align: "left",
    widthPctShare: 0,
    widthPxMin: 0,
  },
  {
    id: "status",
    HeaderComponent: () => (
      <Typography variant="body2" fontWeight={600}>
        Status
      </Typography>
    ),
    BodyComponent: ({ element }: { element: User }) => (
      <Chip
        label={element.status.charAt(0).toUpperCase() + element.status.slice(1)}
        color={statusColors[element.status] || "default"}
        size="small"
        variant="outlined"
      />
    ),
    align: "center",
    widthPctShare: 0,
    widthPxMin: 0,
  },
  {
    id: "role",
    HeaderComponent: () => (
      <Box display="flex" alignItems="center" gap={1}>
        <Work fontSize="small" />
        <Typography variant="body2" fontWeight={600}>
          Role
        </Typography>
      </Box>
    ),
    BodyComponent: ({ element }: { element: User }) => <Typography variant="body2">{element.role}</Typography>,
    align: "left",
    widthPctShare: 0,
    widthPxMin: 0,
  },
];
