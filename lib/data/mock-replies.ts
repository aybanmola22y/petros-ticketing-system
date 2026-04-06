import type { TicketReply } from "@/types";

export const mockReplies: TicketReply[] = [
  {
    id: "reply-1",
    ticketId: "ticket-1",
    userId: "user-emp-1",
    message:
      "Additional note: the flickering also happens when the laptop is on battery power, not just when plugged in.",
    isInternal: false,
    createdAt: "2026-03-18T10:00:00Z",
  },
  {
    id: "reply-2",
    ticketId: "ticket-1",
    userId: "user-admin-1",
    message:
      "Thanks for the report. I have assigned this to myself and will check the display cable connection first. Please avoid closing the lid too hard for now.",
    isInternal: false,
    createdAt: "2026-03-19T10:30:00Z",
  },
  {
    id: "reply-3",
    ticketId: "ticket-1",
    userId: "user-admin-1",
    message:
      "Internal note: Likely a loose LVDS cable. Need to order replacement part. ETA 3-5 business days.",
    isInternal: true,
    createdAt: "2026-03-19T10:35:00Z",
  },
  {
    id: "reply-4",
    ticketId: "ticket-3",
    userId: "user-emp-2",
    message:
      "I have my timesheet records available if needed. The overtime was approved by my manager Sarah Williams.",
    isInternal: false,
    createdAt: "2026-03-20T09:30:00Z",
  },
  {
    id: "reply-5",
    ticketId: "ticket-3",
    userId: "user-admin-1",
    message:
      "We have received your ticket and are reviewing the payroll records with HR. We will update you within 24 hours.",
    isInternal: false,
    createdAt: "2026-03-21T09:00:00Z",
  },
  {
    id: "reply-6",
    ticketId: "ticket-3",
    userId: "user-admin-1",
    message:
      "Internal: Confirmed with HR that overtime was approved. Payroll correction will be processed in next run. Notify employee.",
    isInternal: true,
    createdAt: "2026-03-21T09:05:00Z",
  },
  {
    id: "reply-7",
    ticketId: "ticket-5",
    userId: "user-admin-1",
    message:
      "Your account was accidentally deactivated during a system update. I have restored access. Please try logging in again.",
    isInternal: false,
    createdAt: "2026-03-16T11:00:00Z",
  },
  {
    id: "reply-8",
    ticketId: "ticket-5",
    userId: "user-emp-1",
    message: "Great, I can log in now. Thank you for the quick fix!",
    isInternal: false,
    createdAt: "2026-03-16T11:30:00Z",
  },
  {
    id: "reply-9",
    ticketId: "ticket-6",
    userId: "user-admin-1",
    message:
      "Please refer to the updated Remote Work Policy document in the company portal under HR Resources. Employees are allowed up to 8 remote days per month with manager approval.",
    isInternal: false,
    createdAt: "2026-03-11T10:00:00Z",
  },
  {
    id: "reply-10",
    ticketId: "ticket-10",
    userId: "user-admin-1",
    message:
      "We are checking with the benefits provider. Your enrollment was recorded on our end. The confirmation email may have gone to your spam folder.",
    isInternal: false,
    createdAt: "2026-03-22T09:00:00Z",
  },
];
