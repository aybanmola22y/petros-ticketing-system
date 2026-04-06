import type {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketReply,
  DashboardStats,
} from "@/types";
import { mockTickets } from "@/lib/data/mock-tickets";
import { mockReplies } from "@/lib/data/mock-replies";

const tickets: Ticket[] = [...mockTickets];
const replies: TicketReply[] = [...mockReplies];

let ticketCounter = tickets.length + 1;
let replyCounter = replies.length + 1;

function padNumber(n: number): string {
  return n.toString().padStart(4, "0");
}

export function getTickets(): Ticket[] {
  return [...tickets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getTicketsByUser(userId: string): Ticket[] {
  return getTickets().filter((t) => t.userId === userId);
}

export function getTicketById(ticketId: string): Ticket | null {
  return tickets.find((t) => t.id === ticketId) ?? null;
}

export interface CreateTicketPayload {
  userId: string;
  title: string;
  description: string;
  category: Ticket["category"];
  priority?: TicketPriority;
}

export function createTicket(payload: CreateTicketPayload): Ticket {
  const now = new Date().toISOString();
  const id = `ticket-${Date.now()}`;
  const year = new Date().getFullYear();
  const ticket: Ticket = {
    id,
    ticketNumber: `TKT-${year}-${padNumber(ticketCounter++)}`,
    userId: payload.userId,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    priority: payload.priority ?? "medium",
    status: "open",
    assignedTo: undefined,
    createdAt: now,
    updatedAt: now,
  };
  tickets.push(ticket);
  return ticket;
}

export function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Ticket | null {
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  return ticket;
}

export function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority
): Ticket | null {
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;
  ticket.priority = priority;
  ticket.updatedAt = new Date().toISOString();
  return ticket;
}

export function assignTicket(
  ticketId: string,
  adminId: string
): Ticket | null {
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;
  ticket.assignedTo = adminId;
  ticket.updatedAt = new Date().toISOString();
  return ticket;
}

export interface AddReplyPayload {
  ticketId: string;
  userId: string;
  message: string;
  isInternal: boolean;
}

export function addReply(payload: AddReplyPayload): TicketReply {
  const reply: TicketReply = {
    id: `reply-${Date.now()}-${replyCounter++}`,
    ticketId: payload.ticketId,
    userId: payload.userId,
    message: payload.message,
    isInternal: payload.isInternal,
    createdAt: new Date().toISOString(),
  };
  replies.push(reply);

  const ticket = tickets.find((t) => t.id === payload.ticketId);
  if (ticket) {
    ticket.updatedAt = new Date().toISOString();
  }

  return reply;
}

export function getRepliesByTicket(ticketId: string): TicketReply[] {
  return replies
    .filter((r) => r.ticketId === ticketId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export function getDashboardStats(userId?: string): DashboardStats {
  const source = userId
    ? tickets.filter((t) => t.userId === userId)
    : tickets;

  return {
    total: source.length,
    open: source.filter((t) => t.status === "open").length,
    inProgress: source.filter((t) => t.status === "in_progress").length,
    resolved: source.filter((t) => t.status === "resolved").length,
    closed: source.filter((t) => t.status === "closed").length,
  };
}
