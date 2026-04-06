import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters"),
  category: z.enum([
    "IT Support",
    "HR Concern",
    "Payroll",
    "Facilities",
    "Admin Request",
    "Others",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export const addReplySchema = z.object({
  message: z.string().min(5, "Reply must be at least 5 characters"),
  isInternal: z.boolean().default(false),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type AddReplyInput = z.infer<typeof addReplySchema>;
