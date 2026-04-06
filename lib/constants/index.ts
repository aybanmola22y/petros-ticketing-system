import type { TicketCategory, TicketPriority, TicketStatus } from "@/types";

export const TICKET_CATEGORIES: TicketCategory[] = [
  "IT Support",
  "HR Concern",
  "Payroll",
  "Facilities",
  "Admin Request",
  "Others",
];

export const TICKET_PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const TICKET_STATUSES: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];
