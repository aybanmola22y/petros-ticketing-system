"use client";

import Link from "next/link";
import type { Ticket, User } from "@/types";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { getUserById } from "@/lib/services/user-service";

interface TicketTableProps {
  tickets: Ticket[];
  basePath: string;
}

export function TicketTable({ tickets, basePath }: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground font-medium">No tickets found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or create a new ticket.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Ticket #
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Title
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Category
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Priority
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => {
              const requester = getUserById(ticket.userId);
              return (
                <tr
                  key={ticket.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`${basePath}/${ticket.id}`}
                      className="font-mono text-xs text-primary hover:underline font-medium"
                    >
                      {ticket.ticketNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <Link
                      href={`${basePath}/${ticket.id}`}
                      className="font-medium hover:text-primary transition-colors line-clamp-1"
                    >
                      {ticket.title}
                    </Link>
                    {requester && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {requester.fullName}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {ticket.category}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(ticket.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
