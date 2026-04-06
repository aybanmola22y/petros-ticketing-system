import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user-admin-1",
    fullName: "Alexandra Chen",
    email: "alexandra.chen@company.com",
    role: "admin",
    department: "IT Operations",
    avatarUrl: undefined,
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "user-emp-1",
    fullName: "Marcus Johnson",
    email: "marcus.johnson@company.com",
    role: "employee",
    department: "Marketing",
    avatarUrl: undefined,
    createdAt: "2024-03-01T09:00:00Z",
  },
  {
    id: "user-emp-2",
    fullName: "Priya Sharma",
    email: "priya.sharma@company.com",
    role: "employee",
    department: "Finance",
    avatarUrl: undefined,
    createdAt: "2024-03-10T10:00:00Z",
  },
];
