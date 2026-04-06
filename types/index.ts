export type UserRole = "admin" | "employee";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketCategory =
  | "IT Support"
  | "HR Concern"
  | "Payroll"
  | "Facilities"
  | "Admin Request"
  | "Others";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketReply {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export type DeviceType =
  | "Laptop"
  | "Desktop"
  | "Monitor"
  | "Phone"
  | "Printer"
  | "Other";

export type DeviceStatus =
  | "In Use"
  | "Available"
  | "Under Repair"
  | "Retired";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  serialNumber: string;
  department: string;
  assignedTo?: string;
  status: DeviceStatus;
  condition: "Good" | "Fair" | "Poor";
  purchaseDate: string;
  notes?: string;
}

export type IssueType =
  | "Hardware Fix"
  | "Software Fix"
  | "Replacement"
  | "Preventive Maintenance"
  | "Data Recovery"
  | "Upgrade";

export type MaintenanceStatus = "Completed" | "In Progress" | "Pending";

export interface MaintenanceRecord {
  id: string;
  deviceId?: string;
  deviceName: string;
  deviceType: DeviceType;
  department: string;
  issueType: IssueType;
  description: string;
  technician: string;
  status: MaintenanceStatus;
  reportedDate: string;
  resolvedDate?: string;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}
